from pydantic import BaseModel
from typing import List, Optional

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
