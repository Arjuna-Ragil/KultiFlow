from fastapi import APIRouter, Depends
from schemas.route import RouteRequest
from services.route_service import RouteService

router = APIRouter()

def get_route_service():
    return RouteService()

@router.post("/optimize")
async def optimize_route(
    payload: RouteRequest,
    route_service: RouteService = Depends(get_route_service)
):
    result = await route_service.optimize_route(payload)
    return result
