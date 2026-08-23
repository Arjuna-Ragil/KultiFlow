from pydantic import BaseModel
from typing import Optional

class SalesData(BaseModel):
    fruit_type: str
    price: float
    is_promo: int
    is_holiday: int
    quality_score: Optional[float] = None
    Tahun: int
    Bulan: int
    Tanggal: int
    Hari_ke_berapa: int
    Is_Weekend: int
