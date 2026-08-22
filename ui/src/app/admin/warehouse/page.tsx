"use client";

import { useState, useEffect } from "react";
import { Plus, Building, Save, MapPin, Trash2, ShieldCheck, Route as RouteIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const LocationPickerMap = dynamic(() => import("../../customer/order/components/LocationPickerMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full rounded-xl bg-gray-100 animate-pulse flex items-center justify-center text-gray-400 text-sm font-semibold">Loading Map Engine...</div>
});

interface Warehouse {
  id: number;
  name: string;
  location: string;
  current_stock_kg: number;
  capacity_kg: number;
  latitude: number | null;
  longitude: number | null;
}

export default function WarehouseManagementPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [capacity, setCapacity] = useState("10000");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/warehouse");
      if (res.ok) {
        const data = await res.json();
        setWarehouses(data);
      }
    } catch (err) {
      console.error("Failed to fetch warehouses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !locationStr || latitude === null || longitude === null) {
      alert("Please fill all fields and pick a location on the map.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/api/warehouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          location: locationStr,
          capacity_kg: parseFloat(capacity) || 10000.0,
          current_stock_kg: 0.0,
          latitude,
          longitude
        })
      });

      if (res.ok) {
        await fetchWarehouses();
        setIsCreating(false);
        setName("");
        setLocationStr("");
        setCapacity("10000");
        setLatitude(null);
        setLongitude(null);
      } else {
        alert("Failed to create warehouse");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating warehouse");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this warehouse?")) return;
    try {
      const res = await fetch(`http://localhost:8000/api/warehouse/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchWarehouses();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 sm:px-8 pt-2 pb-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
              Warehouse Management
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Configure departure hubs for Route Optimization and monitor total capacities.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1.5 rounded-xl bg-[#71C168] hover:bg-[#60ab58] px-4 py-2 text-sm font-bold text-white shadow-xs transition-colors cursor-pointer"
        >
          {isCreating ? <span>Cancel</span> : <><Plus className="h-4 w-4" /><span>Add Warehouse</span></>}
        </button>
      </div>

      {isCreating && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-md mb-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-bold text-[#1F2937] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
            <Building className="h-5 w-5 text-[#71C168]" /> Add New Warehouse
          </h2>
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Warehouse Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Central Jakarta Hub"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Physical Address / Location</label>
                <textarea 
                  value={locationStr}
                  onChange={e => setLocationStr(e.target.value)}
                  placeholder="Complete address..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Total Capacity (kg)</label>
                <input 
                  type="number" 
                  value={capacity}
                  onChange={e => setCapacity(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1E7B34] hover:bg-[#19602a] px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Save Warehouse
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Pinpoint Coordinates (Required for Route Optimization)
              </label>
              <div className="rounded-xl overflow-hidden border border-gray-200 shadow-xs h-64">
                <LocationPickerMap
                  latitude={latitude}
                  longitude={longitude}
                  onLocationSelect={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
              </div>
              {latitude !== null && longitude !== null && (
                <p className="mt-2 text-[11px] font-bold text-[#1E7B34] flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Coordinates Locked: {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-10 flex justify-center text-gray-400">Loading warehouses...</div>
        ) : warehouses.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center shadow-xs">
            <Building className="mx-auto h-10 w-10 text-gray-300" />
            <p className="mt-3 text-sm font-bold text-gray-700">No Warehouses Configured</p>
            <p className="mt-1 text-xs text-gray-400">Add a warehouse to use as a starting point for Route Optimization.</p>
          </div>
        ) : (
          warehouses.map(wh => (
            <div key={wh.id} className="relative rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Building className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1F2937] leading-tight">{wh.name}</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">ID: WH-{wh.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(wh.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  title="Delete Warehouse"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <p className="text-xs text-gray-500 mb-4 line-clamp-2 min-h-[32px]">{wh.location}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-gray-50 p-2 border border-gray-100">
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Stock</span>
                  <span className="font-bold text-[#1F2937] text-sm">{wh.current_stock_kg.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">kg</span></span>
                </div>
                <div className="rounded-xl bg-gray-50 p-2 border border-gray-100">
                  <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Capacity</span>
                  <span className="font-bold text-[#1F2937] text-sm">{wh.capacity_kg.toLocaleString()} <span className="text-[10px] font-normal text-gray-500">kg</span></span>
                </div>
              </div>

              <div className="mt-auto border-t border-gray-100 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {wh.latitude !== null && wh.longitude !== null 
                      ? `${wh.latitude.toFixed(4)}, ${wh.longitude.toFixed(4)}`
                      : "No Coordinates"}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-[#71C168]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#1E7B34]">
                    <ShieldCheck className="h-3 w-3" /> Active
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
