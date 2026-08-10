from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.inspection import router as inspection_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inspection_router, prefix="/api/inspection", tags=["inspection"])

@app.get("/")
async def read_root():
    return {"message": "Hello World"}