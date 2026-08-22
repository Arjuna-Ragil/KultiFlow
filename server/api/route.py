from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from schemas.route import RouteRequest, Lokasi
from services.route_service import RouteService
from config.database import get_db
from models.invoice import Invoice
from models.warehouse import Warehouse

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

@router.post("/dispatch/{invoice_id}")
async def dispatch_order(
    invoice_id: int,
    route_service: RouteService = Depends(get_route_service),
    db: AsyncSession = Depends(get_db)
):
    # 1. Have Pay? (Check DB Invoice)
    result = await db.execute(select(Invoice).filter(Invoice.id == invoice_id))
    invoice = result.scalars().first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
        
    if invoice.payment_status != "Paid":
        raise HTTPException(
            status_code=400, 
            detail=f"Order is not paid (Current status: {invoice.payment_status}). Cannot route."
        )

    # 2. Get Departure (Check DB Warehouse)
    # For prototype, fetch the first available warehouse with enough stock
    w_result = await db.execute(select(Warehouse).filter(Warehouse.current_stock_kg >= invoice.total_weight_kg))
    warehouse = w_result.scalars().first()
    
    if not warehouse:
        # fallback to any warehouse for testing if empty
        w_result = await db.execute(select(Warehouse))
        warehouse = w_result.scalars().first()
        if not warehouse:
            # Create a mock one if none exists in DB yet
            warehouse = Warehouse(name="Main Hub HQ", location="Jakarta", current_stock_kg=5000)
            db.add(warehouse)
            await db.commit()
    
    # 3. Hasil Quality (QC) - Mock integration for now
    qc_passed = True
    if not qc_passed:
        raise HTTPException(status_code=400, detail="Quality Control failed for this batch.")
        
    # 4. Route!
    # Build payload for the AI route model
    destination = Lokasi(
        nama=invoice.delivery_address or "Customer Address",
        lat=-6.200000, # Mock lat
        lon=106.816666, # Mock lon
        demand=int(invoice.total_weight_kg)
    )
    
    route_payload = RouteRequest(
        num_vehicles=1,
        vehicle_capacities=[int(invoice.total_weight_kg) + 100],
        destinations=[destination]
    )
    
    try:
        route_result = await route_service.optimize_route(route_payload)
    except Exception as e:
        # Fallback if route AI service is offline
        route_result = {"status": "success", "route": "Mock route calculated due to AI service downtime"}
        
    return {
        "status": "success",
        "message": "Order dispatched successfully",
        "departure_warehouse": warehouse.name,
        "route_plan": route_result
    }

