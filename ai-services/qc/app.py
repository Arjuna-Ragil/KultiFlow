from fastapi import FastAPI, File, UploadFile
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.efficientnet import preprocess_input
import numpy as np
from PIL import Image
import io

app = FastAPI()
model = load_model("best_model_v3_clean.keras")

@app.get("/")
def root():
    return {"status": "Quality Control API is running"}

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).resize((224, 224)).convert("RGB")
    img_array = np.expand_dims(np.array(img), axis=0)
    img_array = preprocess_input(img_array)

    pred = float(model.predict(img_array)[0][0])
    label = "rotten" if pred > 0.5 else "fresh"
    confidence = pred if label == "rotten" else 1 - pred

    return {"label": label, "confidence": round(confidence, 4)}