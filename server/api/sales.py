from fastapi import APIRouter, Depends
from schemas.sales import SalesData
from services.sales_service import SalesService

router = APIRouter()

def get_sales_service():
    return SalesService()

@router.post("/predict")
async def predict_demand(
    payload: SalesData,
    sales_service: SalesService = Depends(get_sales_service)
):
    result = await sales_service.predict_demand(payload)
    return result
