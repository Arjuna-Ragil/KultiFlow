from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

from dotenv import load_dotenv
load_dotenv()

from price_policy import compute_price_policy
from negotiation_state import create_session, get_session, update_session, clear_session
from negotiation import call_gemini_negotiator 

app = FastAPI(
    title="Smart Commerce API",
    description="API Negosiasi harga otomatis.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    session_id: str
    user_message: str

class ChatResponse(BaseModel):
    session_id: str
    pesan_untuk_pembeli: str
    harga_terakhir: float
    deal: bool
    sisa_kesempatan: int
    is_closed: bool

# ENDPOINT UTAMA: NEGOSIASI
@app.post("/negotiate", response_model=ChatResponse)
async def negotiate_api(request: ChatRequest):
    #Cek apakah API Key Gemini sudah terpasang di sistem
    if not os.environ.get("GEMINI_API_KEY"):
        raise HTTPException(status_code=500, detail="GEMINI_API_KEY belum dikonfigurasi di server.")

    # 2. Ambil sesi yang ada, atau BUAT BARU jika ini pesan pertama
    session = get_session(request.session_id)
    
    if not session:
        policy = compute_price_policy(
            product_name="1 Krat Apel Fuji Premium (Lolos QC)", 
            base_price=200000.0, 
            urgency_score=0.3 #sedikit urgen agar AI mau kasih diskon wajar
        )
        session = create_session(session_id=request.session_id, policy=policy, max_turns=3)

    # agar Pengaman: Tolak jika sesi sudah selesai (deal/kehabisan kesempatan)
    if session.is_closed:
        raise HTTPException(
            status_code=400, 
            detail=f"Sesi ini sudah ditutup (deal={session.is_deal}). Silakan mulai sesi baru."
        )

    # Kurangi jatah giliran (turns) pembeli
    # Karena pesan ini masuk, berarti 1 giliran terpakai.
    current_turns_left = session.turns_left - 1

    #Panggil AI Negotiator (Otak Gemini)
    ai_response = call_gemini_negotiator(
        policy=session.policy,
        conversation_history=session.conversation_history,
        user_message=request.user_message,
        turns_left=current_turns_left
    )

    #Simpan hasil obrolan dan status terbaru ke dalam Memori (State)
    updated_session = update_session(
        session_id=request.session_id,
        user_message=request.user_message,
        ai_response_text=ai_response["pesan_untuk_pembeli"],
        offered_price=ai_response["harga_tawaran_ai"],
        deal_status=ai_response["deal"],
        turns_remaining=current_turns_left
    )

    #Kembalikan respons ke Frontend
    return ChatResponse(
        session_id=updated_session.session_id,
        pesan_untuk_pembeli=ai_response["pesan_untuk_pembeli"],
        harga_terakhir=updated_session.last_offered_price,
        deal=updated_session.is_deal,
        sisa_kesempatan=updated_session.turns_left,
        is_closed=updated_session.is_closed
    )

#endpoint untuk menghapus sesi (berguna saat testing)
@app.delete("/reset/{session_id}")
async def reset_session_api(session_id: str):
    """Endpoint utilitas untuk menghapus riwayat obrolan (berguna saat testing)"""
    clear_session(session_id)
    return {"message": f"Sesi {session_id} berhasil dihapus dan di-reset."}