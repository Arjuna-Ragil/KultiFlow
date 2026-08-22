from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.inspection import router as inspection_router
from api.route import router as route_router
from api.nego import router as nego_router
from api.anomaly import router as anomaly_router
from api.sales import router as sales_router

from contextlib import asynccontextmanager
from config.database import Base, engine
from models.invoice import Invoice
from models.warehouse import Warehouse
from models.quality import FruitQuality

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inspection_router, prefix="/api/inspection", tags=["inspection"])
app.include_router(route_router, prefix="/api/route", tags=["route"])
app.include_router(nego_router, prefix="/api/nego", tags=["nego"])
app.include_router(anomaly_router, prefix="/api/anomaly", tags=["anomaly"])
app.include_router(sales_router, prefix="/api/sales", tags=["sales"])

@app.get("/")
async def read_root():
    return {"message": "Hello World"}