from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class OrderRequest(BaseModel):
    buyer_id: str
    buyer_type: str
    fruit_type: str
    quantity: int
    catalog_price: float
    paid_amount: float
    order_datetime: Optional[datetime] = None

class OrderItem(BaseModel):
    name: str
    quantity: float
    price: float

class FrontendOrderRequest(BaseModel):
    companyName: str = ""
    contactPerson: str = ""
    emailAddress: str = ""
    phoneNumber: str = ""
    deliveryMethod: str = "Standard Freight"
    deliveryAddress: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    totalWeightKg: float = 0.0
    totalAmount: float = 0.0
    shippingFee: float = 0.0
    items: List[OrderItem] = Field(default_factory=list)
