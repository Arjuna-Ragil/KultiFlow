from fastapi import APIRouter, File, UploadFile, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import uuid
from datetime import datetime

from services.qc_service import QualityControlService
from config.database import get_db
from models.quality import FruitQuality
from schemas.inspection import BatchSaveRequest

router = APIRouter()

def get_qc_service():
    return QualityControlService()

@router.post("/inspect")
async def inspect_frame(
    file: UploadFile = File(...),
    qc_service: QualityControlService = Depends(get_qc_service)
):
    result = await qc_service.inspect_image(file)
    return result

@router.post("/save-batch")
async def save_batch_result(
    payload: BatchSaveRequest,
    db: AsyncSession = Depends(get_db)
):
    # Try to find existing record for fruit
    result = await db.execute(select(FruitQuality).where(FruitQuality.fruit_name == payload.fruit_type))
    record = result.scalars().first()

    if record:
        record.latest_score = payload.pass_rate
        record.last_updated = datetime.utcnow()
    else:
        new_record = FruitQuality(
            id=str(uuid.uuid4()),
            fruit_name=payload.fruit_type,
            latest_score=payload.pass_rate
        )
        db.add(new_record)
    
    await db.commit()
    return {"message": "QC batch quality saved successfully"}
