from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib

# 1. Inisialisasi Aplikasi API dan Load Model
app = FastAPI(title="Smart Commerce: Sales & Demand Forecasting API")
pipeline = joblib.load('forecasting_pipeline.pkl')

# 2. Definisikan Format Data yang Diterima (Validasi Input)
class SalesData(BaseModel):
    fruit_type: str
    price: float
    is_promo: int
    is_holiday: int
    quality_score: float
    Tahun: int
    Bulan: int
    Tanggal: int
    Hari_ke_berapa: int
    Is_Weekend: int
    
# 3. Buat Endpoint untuk Prediksi
@app.post("/predict")
def predict_demand(data: SalesData):
    # Ubah data JSON dari request menjadi DataFrame Pandas
    input_dict = data.model_dump()
    input_df = pd.DataFrame([input_dict])
    
    # Lakukan prediksi menggunakan pipeline
    prediksi = pipeline.predict(input_df)[0]
    
    # Kembalikan hasil (Response)
    return {
        "status": "success",
        "fruit_type": data.fruit_type,
        "predicted_demand_qty": round(prediksi)
    }

# Pesan saat membuka halaman root API
@app.get("/")
def home():
    return {"message": "API Smart Commerce Forecasting Aktif! Buka /docs untuk mencoba."}