from pydantic import BaseModel

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
