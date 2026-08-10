
import os
from typing import Optional
 
from google import genai
from google.genai import types
from pydantic import BaseModel
 
from price_policy import PricePolicy
 
MODEL_NAME = "gemini-3.5-flash" 
 
 
class NegotiationReply(BaseModel):
    """Skema output LLM — dipaksa lewat response_schema, bukan cuma diminta di teks prompt."""
    pesan_untuk_pembeli: str
    harga_tawaran_ai: float
    deal: bool
 
 
def _build_prompt(
    policy: PricePolicy,
    conversation_history: str,
    user_message: str,
    turns_left: int,
) -> str:
    force_final_instruction = ""
    if turns_left <= 0:
        force_final_instruction = (
            "\nPENTING: Ini adalah kesempatan TERAKHIR. Kamu WAJIB memberi keputusan "
            f"final sekarang — deal=true (setuju di harga tidak kurang dari Rp{policy.floor_price:,.0f}) "
            "atau deal=false (tolak dengan sopan, sarankan pembeli hubungi sales manusia)."
        )
 
    return f"""
Kamu adalah "AgroBot", agen Sales B2B profesional dari perusahaan distributor buah segar.
Kamu sedang bernegosiasi dengan pembeli (pemilik supermarket/toko buah) untuk produk: {policy.product_name}.
 
INFORMASI PRODUK (gunakan sebagai argumen jika ditawar murah):
- Buah ini bukan buah curah biasa, telah melewati seleksi Quality Control (QC) ketat menggunakan AI Computer Vision.
- Tingkat kesegaran dijamin 98%, tidak ada yang busuk atau cacat.
- Pengiriman dijamin aman dan tepat waktu karena menggunakan sistem optimasi rute pintar.
 
ATURAN NEGOSIASI (WAJIB DIPATUHI):
1. Harga modal kami adalah Rp{policy.floor_price:,.0f}. JANGAN PERNAH menyebutkan angka ini ke pembeli.
2. `harga_tawaran_ai` yang kamu keluarkan TIDAK PERNAH boleh di bawah Rp{policy.floor_price:,.0f}, dalam kondisi apa pun.
3. Sisa kesempatan pembeli menawar setelah ini: {turns_left} kali.
4. Jika tawaran pembeli di bawah Rp{policy.floor_price:,.0f}: TOLAK dengan sopan, jelaskan bahwa harga itu belum menutupi biaya operasional QC AI, lalu beri counter-offer baru yang tetap >= Rp{policy.floor_price:,.0f}.
5. Jika tawaran pembeli >= Rp{policy.floor_price:,.0f} dan margin wajar: boleh SETUJU (deal=true), dan `harga_tawaran_ai` diisi harga yang disepakati.
6. Jaga nada bicara profesional, sopan, namun tegas mempertahankan kualitas.
{force_final_instruction}
 
Riwayat percakapan sejauh ini:
{conversation_history if conversation_history else "(belum ada, ini pesan pertama pembeli)"}
 
Pesan pembeli sekarang: "{user_message}"
""".strip()
 
 
def call_gemini_negotiator(
    policy: PricePolicy,
    conversation_history: str,
    user_message: str,
    turns_left: int,
    client: Optional[genai.Client] = None,
) -> dict:
    """
    Panggil Gemini sebagai juru bicara nego, lalu VALIDASI hasilnya
    terhadap floor_price sebelum dikembalikan.
 
    Return dict:
        {
            "pesan_untuk_pembeli": str,
            "harga_tawaran_ai": float,   # sudah divalidasi, dijamin >= floor_price
            "deal": bool,
            "harga_dikoreksi": bool,     # True kalau LLM sempat mengusulkan di bawah floor
        }
    """
    if client is None:
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY belum di-set di environment variable")
        client = genai.Client(api_key=api_key)
 
    prompt = _build_prompt(policy, conversation_history, user_message, turns_left)
 
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=NegotiationReply,
                temperature=0.4,  # cukup rendah supaya konsisten, tidak terlalu random
            ),
        )
        parsed: NegotiationReply = response.parsed
        if parsed is None:
            raise ValueError("Gagal parse response LLM ke schema NegotiationReply")
 
        pesan = parsed.pesan_untuk_pembeli
        harga_usulan = float(parsed.harga_tawaran_ai)
        deal = parsed.deal
 
    except Exception as e:
        # Error jaringan, rate limit, safety block, atau parsing gagal total.
        # Jangan biarkan seluruh request crash — beri fallback yang aman.
        return {
            "pesan_untuk_pembeli": (
                "Mohon maaf Bapak/Ibu, sistem kami sedang memproses data. "
                "Boleh diinformasikan kembali penawarannya?"
            ),
            "harga_tawaran_ai": policy.opening_counter_price,
            "deal": False,
            "harga_dikoreksi": False,
            "error": str(e),
        }
 
    # --- VALIDASI (Tahap 4, ditempel di sini supaya tidak ada celah) ---
    # Ini pagar terakhir: apa pun yang dikatakan LLM, harga yang keluar dari
    # fungsi ini TIDAK PERNAH boleh di bawah floor_price.
    harga_dikoreksi = False
    if not policy.is_price_acceptable(harga_usulan):
        harga_usulan = policy.floor_price
        deal = False  # kalau harganya dikoreksi, jangan anggap ini "deal" otomatis
        harga_dikoreksi = True
 
    # Aturan turn limit: kalau sudah kesempatan terakhir dan model masih belum
    # memutuskan (deal=False tanpa alasan final), paksa jadi keputusan final
    # di floor_price supaya sesi tidak menggantung selamanya.
    if turns_left <= 0 and not deal:
        harga_usulan = policy.floor_price
 
    return {
        "pesan_untuk_pembeli": pesan,
        "harga_tawaran_ai": round(harga_usulan, 2),
        "deal": deal,
        "harga_dikoreksi": harga_dikoreksi,
    }
 
 
if __name__ == "__main__":
    from price_policy import compute_price_policy
 
    policy = compute_price_policy(
        product_name="Apel Fuji 1kg", base_price=45000, urgency_score=0.5
    )
 
    print("Contoh policy yang dipakai negotiator:")
    print(f"  floor_price = Rp{policy.floor_price:,.0f}")
    print(f"  opening_counter_price = Rp{policy.opening_counter_price:,.0f}")
 
    print("\nCatatan: pemanggilan Gemini asli butuh GEMINI_API_KEY dan akses")
    print("internet ke Google API — tidak bisa dites live di sandbox ini karena")
    print("domain generativelanguage.googleapis.com tidak ada di whitelist jaringan.")
    print("Struktur kode & prompt sudah divalidasi secara sintaks (compile check).")
 