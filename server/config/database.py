import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# The default DATABASE_URL will connect to the docker compose DB
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://kultiflow:password123@localhost:5432/kultiflow_db"
)

try:
    engine = create_async_engine(DATABASE_URL, echo=True)
except Exception:
    # Fallback for local testing if driver not installed
    engine = create_async_engine("sqlite+aiosqlite:///./kultiflow.db", echo=True)

SessionLocal = async_sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

async def get_db():
    async with SessionLocal() as session:
        yield session
