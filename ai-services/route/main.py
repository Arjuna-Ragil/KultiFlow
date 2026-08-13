import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv
import google.generativeai as genai
import json

#Import fungsi solver (algoritma OR-Tools)
from solver import solve_logistics

#Load API Key dari file .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise ValueError("API Key Gemini tidak ditemukan! Pastikan file .env sudah diisi.")

#Konfigurasi AI Agent
genai.configure(api_key=GEMINI_API_KEY)
ai_agent = genai.GenerativeModel('gemini-flash-latest')

#inisialisasi Aplikasi FastAPI
app = FastAPI(title="Smart Logistics API", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Your frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Lokasi(BaseModel):
    nama: str
    lat: float
    lon: float
    urgency: Optional[float] = None
    demand: int

class RouteRequest(BaseModel):
    num_vehicles: int
    vehicle_capacities: List[int]
    destinations: List[Lokasi]

@app.post("/optimize-route")
def optimize_logistics_route(payload: RouteRequest):
    try:
        lokasi_list = [loc.model_dump() for loc in payload.destinations]
        
        #algoritma logistik
        hasil = solve_logistics(
            lokasi_list=lokasi_list,
            num_vehicles=payload.num_vehicles,
            vehicle_capacities=payload.vehicle_capacities
        )

        if hasil.get("status") == "Gagal":
            raise HTTPException(status_code=400, detail=hasil.get("pesan"))

        #AI Agent untuk membaca hasil rute
        prompt = f"""
        Kamu adalah 'Senior Logistics Dispatcher'. Baca JSON hasil rute berikut.
        Berikan instruksi operasional singkat untuk sopir. Jelaskan alasan rutenya (misal: 'Kunjungi Toko X dulu karena urgensi tinggi').
        Gunakan bahasa Indonesia santai tapi profesional, buat dalam bentuk bullet points.
        
        Data: {json.dumps(hasil, indent=2)}
        """
        
        try:
            response_ai = ai_agent.generate_content(prompt)
            hasil["pesan_dispatcher_ai"] = response_ai.text
        except Exception as e:
            hasil["pesan_dispatcher_ai"] = f"Catatan AI Error: {str(e)}"

        return hasil

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))