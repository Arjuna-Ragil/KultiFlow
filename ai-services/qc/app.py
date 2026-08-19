import asyncio
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
import numpy as np
from PIL import Image
import io

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = load_model("best_model_v3_clean.keras")

@app.get("/")
def root():
    return {"status": "Quality Control API is running"}

def _run_prediction(contents: bytes) -> dict:
    try:
        img = Image.open(io.BytesIO(contents)).resize((224, 224)).convert("RGB")
    except Exception:
        raise ValueError("Invalid image file")

    img_array = np.expand_dims(np.array(img), axis=0)
    
    # If the image is largely uniform (e.g. blank background), skip prediction
    if np.std(img_array) < 15.0:
        return {"label": "none", "confidence": 0.0}

    img_array = preprocess_input(img_array)

    pred = float(model.predict(img_array, verbose=0)[0][0])
    label = "rotten" if pred > 0.5 else "fresh"
    confidence = pred if label == "rotten" else 1 - pred

    return {"label": label, "confidence": round(confidence, 4)}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    try:
        result = await asyncio.to_thread(_run_prediction, contents)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error during prediction")