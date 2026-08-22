from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.anomaly import FrontendOrderRequest, OrderRequest
from services.anomaly_service import AnomalyService
from config.database import get_db
from models.invoice import Invoice
import random

router = APIRouter()

def get_anomaly_service():
    return AnomalyService()

@router.post("/check-order")
async def check_order(
    payload: FrontendOrderRequest,
    anomaly_service: AnomalyService = Depends(get_anomaly_service),
    db: AsyncSession = Depends(get_db)
):
    # 1. Map Frontend request to AI Model request
    # The frontend has a total amount and weight, but the AI checks per item.
    is_anomaly = False
    
    for item in payload.items:
        ai_payload = OrderRequest(
            buyer_id="BUY-1000", # Mock buyer id
            buyer_type="wholesale",
            fruit_type=item.name,
            quantity=int(item.quantity),
            catalog_price=item.price,
            paid_amount=item.price * item.quantity
        )
        try:
            # We will catch errors here if the anomaly service is down or unreachable
            result = await anomaly_service.check_order(ai_payload)
            if result.get("is_anomaly") or result.get("status") == "anomaly":
                is_anomaly = True
                break
        except Exception as e:
            print(f"Error checking AI service: {e}")
            # For prototype, if AI service is down, we might allow it or block it. Let's assume safe for now if down.
            pass

    # For testing, we also keep the hardcoded logic from the frontend mock
    name_lower = payload.companyName.lower()
    if "anomaly" in name_lower or "fraud" in name_lower:
        is_anomaly = True
    if payload.totalWeightKg == 999:
        is_anomaly = True

    if is_anomaly:
        return {"status": "anomaly", "message": "AI Risk Engine flagged this order as anomalous."}

    # 2. Safe order -> Save to DB Invoice
    new_order_id = f"#ORD-{random.randint(1000, 9999)}"
    
    new_invoice = Invoice(
        order_number=new_order_id,
        status="Processing",
        payment_status="Pending",
        anomaly_status="Safe",
        total_amount=payload.totalAmount,
        shipping_fee=payload.shippingFee,
        total_weight_kg=payload.totalWeightKg,
        delivery_method=payload.deliveryMethod,
        delivery_address=payload.deliveryAddress,
        company_name=payload.companyName,
        contact_person=payload.contactPerson,
        email_address=payload.emailAddress,
        phone_number=payload.phoneNumber,
        items=[item.model_dump() for item in payload.items]
    )
    
    db.add(new_invoice)
    await db.commit()
    await db.refresh(new_invoice)
    
    return {
        "status": "success",
        "message": "Order validated and invoice created",
        "order_number": new_order_id,
        "invoice_id": new_invoice.id
    }

@router.get("/invoices")
async def get_invoices(db: AsyncSession = Depends(get_db)):
    from sqlalchemy.future import select
    result = await db.execute(select(Invoice).order_by(Invoice.id.desc()))
    invoices = result.scalars().all()
    
    # Format for the frontend
    return [
        {
            "id": f"ord-{inv.id}",
            "orderNumber": inv.order_number,
            "date": inv.date.strftime("%b %d, %Y"),
            "status": inv.status,
            "totalAmount": inv.total_amount,
            "deliveryMethod": inv.delivery_method,
            "deliveryAddress": inv.delivery_address,
            "companyName": inv.company_name,
            "contactPerson": inv.contact_person,
            "emailAddress": inv.email_address,
            "phoneNumber": inv.phone_number,
            "shippingFee": inv.shipping_fee,
            "items": inv.items,
            "payment_status": inv.payment_status
        }
        for inv in invoices
    ]


