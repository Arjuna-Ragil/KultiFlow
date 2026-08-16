import httpx
from fastapi import UploadFile, HTTPException

# Persistent client for the lifetime of the application
_client = None

def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(timeout=30.0)
    return _client

class QualityControlService:
    def __init__(self):
        self.ai_model_url = "http://127.0.0.1:8001/predict" # Jangan lupa nanti ganti boss

    async def inspect_image(self, file: UploadFile) -> dict:
        content = await file.read()
        await file.seek(0)
        
        files = {'file': (file.filename, content, file.content_type)}
        try:
            client = get_client()
            response = await client.post(self.ai_model_url, files=files)
            response.raise_for_status()
            data = response.json()
            return data
        except httpx.HTTPStatusError as e:
            # Pass the upstream error code back to the client if possible
            raise HTTPException(status_code=e.response.status_code, detail=f"AI Service error: {e}")
        except Exception as e:
            # For network errors, etc.
            raise HTTPException(status_code=502, detail=f"Failed to connect to AI Service: {e}")
