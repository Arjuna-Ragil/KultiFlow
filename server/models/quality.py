from sqlalchemy import Column, String, Float, DateTime
from datetime import datetime
from config.database import Base

class FruitQuality(Base):
    __tablename__ = "fruit_qualities"

    id = Column(String, primary_key=True, index=True)
    fruit_name = Column(String, unique=True, index=True)
    latest_score = Column(Float, default=0.85)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
