from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, JSON
from datetime import datetime
from config.database import Base

class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True)
    date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="Processing") # Processing, Delivered, Cancelled
    payment_status = Column(String, default="Pending") # Pending, Paid
    anomaly_status = Column(String, default="Safe") # Safe, Flagged
    
    total_amount = Column(Float, default=0.0)
    shipping_fee = Column(Float, default=0.0)
    total_weight_kg = Column(Float, default=0.0)
    
    delivery_method = Column(String)
    delivery_address = Column(String)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    company_name = Column(String)
    contact_person = Column(String)
    email_address = Column(String)
    phone_number = Column(String)
    
    # Store items as a JSON list for simplicity in this prototype
    items = Column(JSON, default=list)
