from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.inspection import router as inspection_router
from api.route import router as route_router
from api.nego import router as nego_router
from api.anomaly import router as anomaly_router
from api.sales import router as sales_router

app = FastAPI()

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