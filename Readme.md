# 🛡️ Invoice PO & Anomaly Detector API

Layanan backend cerdas untuk sistem Smart Commerce. API ini bertugas sebagai "Gatekeeper" (Penjaga Gerbang) yang akan mengecek setiap pesanan (Order) menggunakan Statistical Threshold (Z-Score & Price Ratio). 
Jika pesanan wajar, sistem akan mencetak Invoice. Jika tidak wajar (anomali), pesanan akan ditolak.

### Cara Menjalankan Lokal (Tanpa Docker)
1. Install library: `pip install -r requirements.txt`
2. Jalankan server: `uvicorn main:app --host 0.0.0.0 --port 8002 --reload`
3. Cek Swagger UI interaktif di: **http://localhost:8002/docs**

### Panduan Integrasi (Untuk Tim Frontend)

Gunakan endpoint di bawah ini untuk mengirim data checkout dari website:

*   **URL Endpoint:** `http://localhost:8002/check-order`
*   **Method:** `POST`
*   **Headers:** `Content-Type: application/json`

**Contoh Payload (JSON) dari Frontend:**
```json
{
  "buyer_id": "BUY-0001",
  "buyer_type": "retail",
  "fruit_type": "Apel",
  "quantity": 2,
  "catalog_price": 20000.0,
  "paid_amount": 40000.0
}

### Jika ada anomali terdeteksi

{
  "status": "REJECTED",
  "reasons": [
    "quantity_unusual (z=4.2, baseline=personal)",
    "price_mismatch (ratio=0.45)"
  ],
  "invoice": null
}
