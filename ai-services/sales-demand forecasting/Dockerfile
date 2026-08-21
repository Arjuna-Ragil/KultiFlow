# Gunakan Python versi ringan
FROM python:3.9-slim

# Set direktori kerja
WORKDIR /app

# Salin file requirements dan install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh file proyek
COPY . .

# Beri tahu port mana yang digunakan (standar FastAPI/Uvicorn adalah 8000)
EXPOSE 8000

# Perintah untuk menjalankan server API
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]