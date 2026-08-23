from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from schemas.sales import SalesData
from services.sales_service import SalesService
from config.database import get_db
from models.quality import FruitQuality

router = APIRouter()

def get_sales_service():
    return SalesService()

@router.post("/predict")
async def predict_demand(
    payload: SalesData,
    sales_service: SalesService = Depends(get_sales_service),
    db: AsyncSession = Depends(get_db)
):
    if payload.quality_score is None:
        result = await db.execute(select(FruitQuality).where(FruitQuality.fruit_name == payload.fruit_type))
        record = result.scalars().first()
        payload.quality_score = record.latest_score if record else 0.85

    result = await sales_service.predict_demand(payload)
    return result
