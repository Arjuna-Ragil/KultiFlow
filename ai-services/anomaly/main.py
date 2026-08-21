from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
import pandas as pd
import itertools

from anomaly_detector import compute_buyer_baseline, compute_population_baseline, process_order

app = FastAPI(
    title="Invoice PO & Anomaly Detector",
    description="Smart Commerce Gatekeeper & Automated Invoicing Service",
    version="1.0.0"
)

# 1. Pasang CORS agar Frontend bisa akses tanpa kendala
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Inisialisasi Baseline & Counter (Loaded in-memory)
_orders_history = pd.read_csv("dummy_orders.csv", parse_dates=["order_datetime"])
_buyer_baseline = compute_buyer_baseline(_orders_history)
_population_baseline = compute_population_baseline(_orders_history)
_invoice_counter = itertools.count(start=1)


class OrderRequest(BaseModel):
    buyer_id: str
    buyer_type: str                         # "retail" atau "reseller"
    fruit_type: str
    quantity: int
    catalog_price: float
    paid_amount: float
    order_datetime: Optional[datetime] = None  # Field opsional


@app.post("/check-order")
def check_order_endpoint(order: OrderRequest):
    order_dict = order.model_dump()
    if order_dict["order_datetime"] is None:
        order_dict["order_datetime"] = datetime.now()

    # Eksekusi deteksi anomali & pembuatan invoice
    result = process_order(
        order_dict,
        _buyer_baseline,
        _population_baseline,
        invoice_counter=next(_invoice_counter),
    )
    return result


@app.get("/")
def root():
    return {
        "status": "ready",
        "service": "Invoice PO & Anomaly Detector",
        "docs": "/docs"
    }