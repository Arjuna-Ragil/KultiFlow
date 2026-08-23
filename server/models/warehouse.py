from sqlalchemy import Column, Integer, String, Float
from config.database import Base

class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    current_stock_kg = Column(Float, default=0.0)
    capacity_kg = Column(Float, default=10000.0)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
