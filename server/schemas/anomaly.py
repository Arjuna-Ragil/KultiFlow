from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class OrderRequest(BaseModel):
    buyer_id: str
    buyer_type: str
    fruit_type: str
    quantity: int
    catalog_price: float
    paid_amount: float
    order_datetime: Optional[datetime] = None
