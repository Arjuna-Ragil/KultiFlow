import httpx
from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from schemas.nego import ChatRequest

_client = None

def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=30.0)
    return _client

class NegoService:
    def __init__(self):
        self.ai_model_url = "http://127.0.0.1:8003/negotiate"

    async def negotiate(self, data: ChatRequest) -> dict:
        try:
            client = get_client()
            payload = jsonable_encoder(data)
            response = await client.post(self.ai_model_url, json=payload)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            try:
                error_detail = e.response.json().get("detail", str(e))
            except:
                error_detail = str(e)
            raise HTTPException(status_code=e.response.status_code, detail=error_detail)
        except httpx.RequestError as e:
            raise HTTPException(status_code=503, detail=f"Service unavailable: {str(e)}")
