# Smart Logistics API - Spesifikasi Input & Output

## 1. REQUEST FORMAT (Input yang dikirim Frontend)

### Endpoint

```
POST http://localhost:8000/optimize-route
Content-Type: application/json
```

### Request Body Structure

```json
{
  "num_vehicles": NUMBER,
  "vehicle_capacities": [NUMBER, NUMBER, ...],
  "destinations": [
    {
      "nama": STRING,
      "lat": NUMBER,
      "lon": NUMBER,
      "urgency": NUMBER (optional, 0.0-1.0),
      "demand": NUMBER
    },
    ...
  ]
}
```

### Field Descriptions

| Field                    | Type         | Required | Constraints                                | Example           |
| ------------------------ | ------------ | -------- | ------------------------------------------ | ----------------- |
| `num_vehicles`           | Integer      | ✅       | > 0                                        | `3`               |
| `vehicle_capacities`     | Array of Int | ✅       | Length must equal `num_vehicles`, each > 0 | `[100, 150, 120]` |
| `destinations[].nama`    | String       | ✅       | Non-empty                                  | `"Depot Pusat"`   |
| `destinations[].lat`     | Float        | ✅       | -90 to 90                                  | `-6.2088`         |
| `destinations[].lon`     | Float        | ✅       | -180 to 180                                | `106.8456`        |
| `destinations[].urgency` | Float        | ❌       | 0.0 to 1.0 (0=santai, 1=sangat mendesak)   | `0.8`             |
| `destinations[].demand`  | Integer      | ✅       | >= 0                                       | `50`              |

### Complete Example Request

```json
{
  "num_vehicles": 3,
  "vehicle_capacities": [100, 150, 120],
  "destinations": [
    {
      "nama": "Depot Pusat",
      "lat": -6.2088,
      "lon": 106.8456,
      "urgency": null,
      "demand": 0
    },
    {
      "nama": "Toko Alpha",
      "lat": -6.21,
      "lon": 106.85,
      "urgency": 0.9,
      "demand": 50
    },
    {
      "nama": "Toko Beta",
      "lat": -6.215,
      "lon": 106.845,
      "urgency": 0.3,
      "demand": 30
    },
    {
      "nama": "Toko Gamma",
      "lat": -6.22,
      "lon": 106.855,
      "urgency": 0.7,
      "demand": 45
    }
  ]
}
```

---

## 2. RESPONSE FORMAT (Output yang diterima Frontend)

### Success Response (Status 200)

```json
{
  "status": "Sukses",
  "total_waktu_menit": NUMBER,
  "total_muatan": NUMBER,
  "toko_di_drop": [STRING, ...],
  "rute_kendaraan": [
    {
      "id_kendaraan": NUMBER,
      "detail_rute": [
        {
          "lokasi": STRING,
          "tiba_menit_ke": NUMBER,
          "muatan_bawaan": NUMBER
        },
        ...
      ],
      "waktu_tempuh_kendaraan": NUMBER,
      "total_muatan": NUMBER
    },
    ...
  ],
  "pesan_dispatcher_ai": STRING
}
```

### Field Descriptions

| Field                                          | Type    | Description                                                                    |
| ---------------------------------------------- | ------- | ------------------------------------------------------------------------------ |
| `status`                                       | String  | `"Sukses"` atau `"Gagal"`                                                      |
| `total_waktu_menit`                            | Integer | Total waktu tempuh semua kendaraan (menit)                                     |
| `total_muatan`                                 | Integer | Total muatan yang berhasil dikirim                                             |
| `toko_di_drop`                                 | Array   | Daftar nama toko yang terpaksa dilewatkan (karena kapasitas/waktu tidak cukup) |
| `rute_kendaraan[].id_kendaraan`                | Integer | ID kendaraan (1, 2, 3, ...)                                                    |
| `rute_kendaraan[].detail_rute[].lokasi`        | String  | Nama lokasi kunjungan                                                          |
| `rute_kendaraan[].detail_rute[].tiba_menit_ke` | Integer | Waktu tiba di lokasi (menit dari start)                                        |
| `rute_kendaraan[].detail_rute[].muatan_bawaan` | Integer | Beban/muatan yang dibawa saat itu                                              |
| `rute_kendaraan[].waktu_tempuh_kendaraan`      | Integer | Total waktu perjalanan kendaraan (menit)                                       |
| `rute_kendaraan[].total_muatan`                | Integer | Total demand yang dikerjakan kendaraan                                         |
| `pesan_dispatcher_ai`                          | String  | Instruksi sopir dari AI Gemini (dengan bullet points)                          |

### Complete Example Response (Success)

```json
{
  "status": "Sukses",
  "total_waktu_menit": 135,
  "total_muatan": 125,
  "toko_di_drop": [],
  "rute_kendaraan": [
    {
      "id_kendaraan": 1,
      "detail_rute": [
        {
          "lokasi": "Depot Pusat",
          "tiba_menit_ke": 0,
          "muatan_bawaan": 0
        },
        {
          "lokasi": "Toko Alpha",
          "tiba_menit_ke": 15,
          "muatan_bawaan": 50
        },
        {
          "lokasi": "Toko Gamma",
          "tiba_menit_ke": 35,
          "muatan_bawaan": 95
        },
        {
          "lokasi": "Depot Pusat (Kembali)",
          "tiba_menit_ke": 55,
          "muatan_akhir": 95
        }
      ],
      "waktu_tempuh_kendaraan": 55,
      "total_muatan": 95
    },
    {
      "id_kendaraan": 2,
      "detail_rute": [
        {
          "lokasi": "Depot Pusat",
          "tiba_menit_ke": 0,
          "muatan_bawaan": 0
        },
        {
          "lokasi": "Toko Beta",
          "tiba_menit_ke": 12,
          "muatan_bawaan": 30
        },
        {
          "lokasi": "Depot Pusat (Kembali)",
          "tiba_menit_ke": 40,
          "muatan_akhir": 30
        }
      ],
      "waktu_tempuh_kendaraan": 40,
      "total_muatan": 30
    }
  ],
  "pesan_dispatcher_ai": "• Sopir 1: Prioritaskan Toko Alpha (urgensi 0.9) ke depan karena pesanan sangat mendesak\n• Toko Gamma bisa dikunjungi setelahnya karena urgensi cukup tinggi (0.7)\n• Sopir 2: Kunjungi Toko Beta saja, muatan ringan dan waktu cukup\n• Total waktu operasi: 135 menit untuk semua kendaraan"
}
```

### Error Response (Status 400/500)

```json
{
  "detail": "Tidak ada solusi rute yang ditemukan (semua parameter melanggar batas)."
}
```

atau

```json
{
  "detail": "num_vehicles harus positif"
}
```

---

## 3. FRONTSIDE CHECKLIST

### Input Validation (sebelum send request)

- [ ] Minimal 1 kendaraan
- [ ] Jumlah `vehicle_capacities` = `num_vehicles`
- [ ] Semua kapasitas kendaraan > 0
- [ ] Minimal 1 destinasi (depot)
- [ ] Setiap lokasi punya: `nama`, `lat`, `lon`, `demand`
- [ ] Latitude: -90 sampai 90
- [ ] Longitude: -180 sampai 180
- [ ] Demand >= 0
- [ ] Urgency (jika ada): 0.0 sampai 1.0

### Output Display

- [ ] Tampilkan status (Sukses/Gagal)
- [ ] Jika Sukses:
  - [ ] Tampilkan ringkasan (total waktu, total muatan)
  - [ ] Tampilkan daftar toko yang di-drop (jika ada)
  - [ ] Tampilkan detail rute per kendaraan dengan timeline
  - [ ] Tampilkan pesan dispatcher AI
- [ ] Jika Error:
  - [ ] Tampilkan pesan error dengan jelas

---

## 4. CONTOH IMPLEMENTASI FETCH (JavaScript)

```javascript
async function optimizeRoute(formData) {
  try {
    const response = await fetch('http://localhost:8000/optimize-route', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Error:', data.detail);
      return { error: data.detail };
    }

    return data;
  } catch (error) {
    return { error: error.message };
  }
}

// Usage:
const result = await optimizeRoute({
  num_vehicles: 3,
  vehicle_capacities: [100, 150, 120],
  destinations: [
    /* ... */
  ],
});

if (result.error) {
  console.log('Optimization failed:', result.error);
} else {
  console.log('Routes:', result.rute_kendaraan);
  console.log('AI Notes:', result.pesan_dispatcher_ai);
}
```

---

## 5. TESTING DATA

### Minimal Valid Request

```json
{
  "num_vehicles": 1,
  "vehicle_capacities": [100],
  "destinations": [
    {
      "nama": "Depot",
      "lat": 0,
      "lon": 0,
      "urgency": null,
      "demand": 0
    },
    {
      "nama": "Toko 1",
      "lat": 0.001,
      "lon": 0.001,
      "urgency": 0.5,
      "demand": 50
    }
  ]
}
```

### High Urgency Scenario (untuk test prioritas)

```json
{
  "num_vehicles": 2,
  "vehicle_capacities": [50, 50],
  "destinations": [
    {
      "nama": "Depot",
      "lat": -6.2088,
      "lon": 106.8456,
      "urgency": null,
      "demand": 0
    },
    {
      "nama": "Toko Urgent",
      "lat": -6.21,
      "lon": 106.85,
      "urgency": 1.0,
      "demand": 30
    },
    {
      "nama": "Toko Normal",
      "lat": -6.215,
      "lon": 106.845,
      "urgency": 0.1,
      "demand": 40
    }
  ]
}
```
