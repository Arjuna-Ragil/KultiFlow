from typing import Dict, Optional
from pydantic import BaseModel
 
from price_policy import PricePolicy
 
 
class SessionState(BaseModel):
    session_id: str
    policy: PricePolicy                 
    conversation_history: str = ""
    turns_left: int
    last_offered_price: float = 0.0     
    is_deal: bool = False
    is_closed: bool = False
 
 
_active_sessions: Dict[str, SessionState] = {}
 
 
def create_session(session_id: str, policy: PricePolicy, max_turns: int = 3) -> SessionState:
    """
    Membuat sesi baru. Dipanggil SEKALI di awal nego (saat pesan pertama
    konsumen masuk) — policy (floor_price dkk) dikunci di sini dan tidak
    dihitung ulang lagi sepanjang sesi.
 
    Kalau session_id sudah ada, sesi lama dikembalikan apa adanya (tidak
    di-reset) — untuk benar-benar mengulang, panggil clear_session() dulu.
    """
    if session_id not in _active_sessions:
        _active_sessions[session_id] = SessionState(
            session_id=session_id,
            policy=policy,
            turns_left=max_turns,
            last_offered_price=policy.opening_counter_price,
        )
    return _active_sessions[session_id]
 
 
def get_session(session_id: str) -> Optional[SessionState]:
    """Ambil sesi yang sudah ada. Return None kalau belum pernah dibuat."""
    return _active_sessions.get(session_id)
 
 
def update_session(
    session_id: str,
    user_message: str,
    ai_response_text: str,
    offered_price: float,
    deal_status: bool,
    turns_remaining: int,
) -> SessionState:
    """
    Memperbarui riwayat & status sesi. Menolak update kalau sesi sudah
    is_closed=True — sesi yang sudah selesai (deal atau giliran habis)
    tidak bisa "dihidupkan lagi" lewat jalur ini.
    """
    session = _active_sessions.get(session_id)
    if session is None:
        raise KeyError(f"Sesi '{session_id}' belum dibuat. Panggil create_session() dulu.")
 
    if session.is_closed:
        raise ValueError(
            f"Sesi '{session_id}' sudah ditutup (deal={session.is_deal}) — "
            "tidak bisa diupdate lagi. Buat sesi baru kalau mau nego ulang."
        )
 
    session.conversation_history += f"\nPembeli: {user_message}\nAgroBot: {ai_response_text}"
    session.last_offered_price = offered_price
    session.turns_left = turns_remaining
    session.is_deal = deal_status
 
    if deal_status or turns_remaining <= 0:
        session.is_closed = True
 
    return session
 
 
def clear_session(session_id: str) -> None:
    """Menghapus sesi dari memori (berguna untuk mulai nego ulang dari nol)."""
    _active_sessions.pop(session_id, None)
 
 
if __name__ == "__main__":
    from price_policy import compute_price_policy
 
    policy = compute_price_policy("1 Krat Apel Fuji Premium (Lolos QC)", base_price=200000, urgency_score=0.5)
    s = create_session("sesi_001", policy=policy, max_turns=3)
    print("Sesi baru:", s.session_id, "| floor_price terkunci di:", s.policy.floor_price)
 
    update_session("sesi_001", "Boleh 30rb?", "Maaf, di bawah standar kami...", 33000, False, 2)
    s = get_session("sesi_001")
    print("\nSetelah 1 giliran -> turns_left:", s.turns_left, "| is_closed:", s.is_closed)
 
    update_session("sesi_001", "35rb deh", "Baik, deal!", 35000, True, 1)
    s = get_session("sesi_001")
    print("\nSetelah deal -> is_deal:", s.is_deal, "| is_closed:", s.is_closed)
 
    print("\n--- Tes: coba update sesi yang sudah closed ---")
    try:
        update_session("sesi_001", "Eh nego lagi", "Oke boleh", 30000, False, 1)
        print("MASALAH: seharusnya ini ditolak, tapi malah berhasil!")
    except ValueError as e:
        print("Ditolak dengan benar:", e)