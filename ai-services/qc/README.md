## Yang perlu diinstall dulu (sekali aja)
1. Install Python (3.10 atau 3.11) dari python.org kalau belum ada
2. Buka terminal/command prompt, masuk ke folder ini, jalankan:
   pip install -r requirements.txt

## Cara jalanin API
Di folder ini, jalankan:
   uvicorn app:app --host 0.0.0.0 --port 8000

Kalau berhasil, akan muncul tulisan "Uvicorn running on http://0.0.0.0:8000"
Biarkan terminal ini tetap terbuka selama API dipakai.

const formData = new FormData();
formData.append("file", imageFile);

fetch("http://localhost:8000/predict", { method: "POST", body: formData })
  .then(res => res.json())
  .then(data => console.log(data));
// Output: {"label": "fresh", "confidence": 0.98}