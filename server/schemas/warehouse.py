from pydantic import BaseModel
from typing import Optional

class WarehouseBase(BaseModel):
    name: str
    location: str
    current_stock_kg: float = 0.0
    capacity_kg: float = 10000.0
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    current_stock_kg: Optional[float] = None
    capacity_kg: Optional[float] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class WarehouseResponse(WarehouseBase):
    id: int

    class Config:
        from_attributes = True
