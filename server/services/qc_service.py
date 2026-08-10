import httpx
from fastapi import UploadFile

class QualityControlService:
    def __init__(self):
        self.ai_model_url = "http://127.0.0.1:8001/predict" # Jangan lupa nanti ganti boss

    async def inspect_image(self, file: UploadFile) -> dict:
        async with httpx.AsyncClient() as client:
            content = await file.read()
            await file.seek(0)
            
            files = {'file': (file.filename, content, file.content_type)}
            try:
                response = await client.post(self.ai_model_url, files=files)
                response.raise_for_status()
                data = response.json()
                return data
            except httpx.HTTPStatusError as e:
                return {"error": f"HTTP error occurred: {e}"}
            except Exception as e:
                return {"error": f"An error occurred: {e}"}
