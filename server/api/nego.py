from fastapi import APIRouter, Depends
from schemas.nego import ChatRequest
from services.nego_service import NegoService

router = APIRouter()

def get_nego_service():
    return NegoService()

@router.post("/negotiate")
async def negotiate(
    payload: ChatRequest,
    nego_service: NegoService = Depends(get_nego_service)
):
    result = await nego_service.negotiate(payload)
    return result
