from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from config.database import get_db
from models.warehouse import Warehouse
from schemas.warehouse import WarehouseCreate, WarehouseUpdate, WarehouseResponse

router = APIRouter(prefix="/api/warehouse", tags=["Warehouse"])

@router.get("", response_model=List[WarehouseResponse])
async def list_warehouses(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Warehouse))
    return result.scalars().all()

@router.post("", response_model=WarehouseResponse)
async def create_warehouse(data: WarehouseCreate, db: AsyncSession = Depends(get_db)):
    db_wh = Warehouse(**data.model_dump())
    db.add(db_wh)
    await db.commit()
    await db.refresh(db_wh)
    return db_wh

@router.put("/{warehouse_id}", response_model=WarehouseResponse)
async def update_warehouse(warehouse_id: int, data: WarehouseUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))
    db_wh = result.scalars().first()
    if not db_wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_wh, key, value)
        
    await db.commit()
    await db.refresh(db_wh)
    return db_wh

@router.delete("/{warehouse_id}")
async def delete_warehouse(warehouse_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Warehouse).where(Warehouse.id == warehouse_id))
    db_wh = result.scalars().first()
    if not db_wh:
        raise HTTPException(status_code=404, detail="Warehouse not found")
        
    await db.delete(db_wh)
    await db.commit()
    return {"message": "Warehouse deleted"}
