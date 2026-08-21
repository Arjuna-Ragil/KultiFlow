import httpx
from schemas.anomaly import OrderRequest
from fastapi.encoders import jsonable_encoder

_client = None

def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=30.0)
    return _client

class AnomalyService:
    def __init__(self):
        self.ai_model_url = "http://127.0.0.1:8004/check-order"

    async def check_order(self, data: OrderRequest) -> dict:
        try:
            client = get_client()
            payload = jsonable_encoder(data)
            response = await client.post(self.ai_model_url, json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            raise e
