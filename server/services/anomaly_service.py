import httpx
import os
from fastapi.encoders import jsonable_encoder
from schemas.anomaly import OrderRequest

_client = None

def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=30.0)
    return _client

class AnomalyService:
    def __init__(self):
        base_url = os.getenv("ANOMALY_SERVICE_URL", "http://127.0.0.1:8004")
        self.ai_model_url = f"{base_url}/check-order"

    async def check_order(self, data: OrderRequest) -> dict:
        try:
            client = get_client()
            payload = jsonable_encoder(data)
            response = await client.post(self.ai_model_url, json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise e
