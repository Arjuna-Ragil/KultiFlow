import math
import requests

def hitung_haversine(lat1, lon1, lat2, lon2):
    """Fallback: Menghitung jarak garis lurus menggunakan rumus Haversine"""
    R = 6371.0 #radius bumi dalam km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    jarak_km = R * c
    
    # Asumsi kecepatan rata-rata 40 km/jam untuk fallback estimasi menit
    estimasi_menit = int((jarak_km / 40.0) * 60)
    return estimasi_menit

def get_distance_matrix(lokasi_list):
    """
    Input: list of dictionary dengan key 'lat' dan 'lon'
    Output: Matrix NxN waktu tempuh dalam menit
    """
    # buat format cuy OSRM itu membutuhkan (longitude, latitude) dipisah titik koma
    koordinat_str = ";".join([f"{loc['lon']},{loc['lat']}" for loc in lokasi_list])
    url = f"http://router.project-osrm.org/table/v1/driving/{koordinat_str}?annotations=duration"
    
    try:
        response = requests.get(url, timeout=5)
        data = response.json()
        if data.get('code') == 'Ok':
            print("[INFO] Berhasil menggunakan OSRM (Jalan Asli)")
            return [[int(detik / 60) for detik in baris] for baris in data['durations']]
    except Exception as e:
        print(f"[WARNING] OSRM gagal ({e}). Beralih ke Haversine Fallback.")
    
    # Fallback jika OSRM gagal/timeout
    print("[INFO] Menggunakan Haversine Fallback")
    jumlah = len(lokasi_list)
    matrix = [[0] * jumlah for _ in range(jumlah)]
    for i in range(jumlah):
        for j in range(jumlah):
            if i != j:
                matrix[i][j] = hitung_haversine(
                    lokasi_list[i]['lat'], lokasi_list[i]['lon'],
                    lokasi_list[j]['lat'], lokasi_list[j]['lon']
                )
    return matrix