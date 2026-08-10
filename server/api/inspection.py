from fastapi import APIRouter, File, UploadFile, Depends
from services.qc_service import QualityControlService

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
