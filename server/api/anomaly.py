from fastapi import APIRouter, Depends
from schemas.anomaly import OrderRequest
from services.anomaly_service import AnomalyService

router = APIRouter()

def get_anomaly_service():
    return AnomalyService()

@router.post("/check-order")
async def check_order(
    payload: OrderRequest,
    anomaly_service: AnomalyService = Depends(get_anomaly_service)
):
    result = await anomaly_service.check_order(payload)
    return result
