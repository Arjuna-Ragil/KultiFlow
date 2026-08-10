## Yang perlu diinstall dulu (sekali aja)

1. Install Python (3.10 atau 3.11) dari python.org kalau belum ada
2. Buka terminal/command prompt, masuk ke folder ini, jalankan: `pip install -r requirements.txt`
3. Bikin file `.env` di folder ini, isinya (tanpa tanda kutip): `GEMINI_API_KEY=api_key_kamu_di_sini`

## Cara jalanin API

Di folder ini, jalankan: `uvicorn main:app --host 0.0.0.0 --port 8000 --reload`

Kalau berhasil, akan muncul tulisan "Uvicorn running on http://0.0.0.0:8000" Biarkan terminal ini tetap terbuka selama API dipakai. (Bisa buka http://localhost:8000/docs buat ngetes langsung di browser).

**Contoh manggil API-nya dari Frontend (pakai Fetch):**
```javascript
const requestBody = {
  session_id: "sesi_001",
  user_message: "Bang, 215 ribu dapet gak 1 krat?"
};

fetch("http://localhost:8000/negotiate", { 
  method: "POST", 
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody) 
})
.then(res => res.json())
.then(data => console.log(data)); 

// Output: {"session_id": "sesi_001", "pesan_untuk_pembeli": "Maaf belum dapet...", "harga_terakhir": 230000, "deal": false, "sisa_kesempatan": 2, "is_closed": false}