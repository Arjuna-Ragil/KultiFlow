"use client";

import { useState } from "react";

export default function TestServicesPage() {
  const [results, setResults] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const backendUrl = "http://localhost:8000";

  const handleTest = async (serviceName: string, endpoint: string, payload: any) => {
    setLoading((prev) => ({ ...prev, [serviceName]: true }));
    try {
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      let data;
      try {
         data = await response.json();
      } catch (e) {
         data = { error: "Failed to parse JSON response" };
      }

      if (!response.ok) {
        setResults((prev) => ({ ...prev, [serviceName]: { error: data } }));
      } else {
        setResults((prev) => ({ ...prev, [serviceName]: data }));
      }
    } catch (error: any) {
      setResults((prev) => ({ ...prev, [serviceName]: { error: error.message } }));
    } finally {
      setLoading((prev) => ({ ...prev, [serviceName]: false }));
    }
  };

  const services = [
    {
      name: "Route Optimization",
      endpoint: "/api/route/optimize",
      payload: {
        num_vehicles: 2,
        vehicle_capacities: [100, 100],
        destinations: [
          {
            nama: "Toko A",
            lat: -6.200000,
            lon: 106.816666,
            demand: 20,
          },
          {
            nama: "Toko B",
            lat: -6.210000,
            lon: 106.820000,
            demand: 30,
          },
        ],
      },
    },
    {
      name: "Negotiation (Nego)",
      endpoint: "/api/nego/negotiate",
      payload: {
        session_id: "test_session_123",
        user_message: "Bisa kurang gak harganya?",
      },
    },
    {
      name: "Anomaly Detection",
      endpoint: "/api/anomaly/check-order",
      payload: {
        buyer_id: "buyer_1",
        buyer_type: "retail",
        fruit_type: "apple",
        quantity: 500,
        catalog_price: 20000,
        paid_amount: 10000000,
      },
    },
    {
      name: "Sales Demand Forecasting",
      endpoint: "/api/sales/predict",
      payload: {
        fruit_type: "Apel Fuji",
        price: 25000,
        is_promo: 1,
        is_holiday: 0,
        quality_score: 9.5,
        Tahun: 2026,
        Bulan: 8,
        Tanggal: 21,
        Hari_ke_berapa: 233,
        Is_Weekend: 0,
      },
    },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto text-black">
      <h1 className="text-3xl font-bold mb-8">AI Services Test Page</h1>
      <p className="mb-8 text-gray-600">
        Click the buttons below to send a pre-configured request to the backend API Gateway for each service.
      </p>

      <div className="grid grid-cols-1 gap-8">
        {services.map((service) => (
          <div key={service.name} className="border p-6 rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{service.name}</h2>
              <button
                onClick={() => handleTest(service.name, service.endpoint, service.payload)}
                disabled={loading[service.name]}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading[service.name] ? "Testing..." : "Send Request"}
              </button>
            </div>
            
            <div className="mb-4">
              <p className="font-semibold text-sm text-gray-500 mb-1">Endpoint: <span className="font-mono text-blue-600">{service.endpoint}</span></p>
              <details>
                <summary className="cursor-pointer text-sm font-semibold text-gray-500">View Payload</summary>
                <pre className="bg-gray-100 p-2 rounded text-xs mt-2 overflow-auto">
                  {JSON.stringify(service.payload, null, 2)}
                </pre>
              </details>
            </div>

            <div>
              <p className="font-semibold text-sm text-gray-500 mb-1">Result:</p>
              <div className="bg-gray-900 text-green-400 p-4 rounded min-h-[100px] overflow-auto">
                {results[service.name] ? (
                  <pre className="text-sm">
                    {JSON.stringify(results[service.name], null, 2)}
                  </pre>
                ) : (
                  <span className="text-gray-500 italic text-sm">No request sent yet...</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
