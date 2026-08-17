import React from "react";
import type { FormState, ValidationError } from "../types";

interface RouteFormProps {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  errors: ValidationError;
  loading: boolean;
  errorMsg: string | null;
  totalDemand: number;
  handleAddDestination: () => void;
  handleRemoveDestination: (id: string) => void;
  handleReset: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
}

export function RouteForm({
  form,
  setForm,
  errors,
  loading,
  errorMsg,
  totalDemand,
  handleAddDestination,
  handleRemoveDestination,
  handleReset,
  handleSubmit,
}: RouteFormProps) {
  return (
    <form className="col-span-12 md:col-span-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs" onSubmit={handleSubmit}>
      <h2 className="text-lg font-bold text-[#1F2937] mb-6 border-b border-gray-100 pb-4">Fleet Configuration</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Number of Vehicles</label>
          <input
            type="number"
            min={1}
            className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm transition-all focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20"
            value={form.vehicleCount}
            onChange={(ev) => setForm((cur) => ({ ...cur, vehicleCount: Math.max(1, Number(ev.target.value) || 1) }))}
          />
          <p className="mt-1.5 text-xs text-gray-500">How many delivery vehicles are available?</p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Capacities</label>
          {errors.capacities && <div className="text-sm text-red-600 mb-2 font-medium">{errors.capacities}</div>}
          <div className="grid grid-cols-2 gap-4">
            {form.capacities.map((c, idx) => (
              <div key={idx} className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">Vehicle {idx + 1}</span>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm transition-all focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20"
                  value={c}
                  onChange={(ev) => setForm((cur) => {
                    const caps = [...cur.capacities]
                    caps[idx] = ev.target.value
                    return { ...cur, capacities: caps }
                  })}
                  placeholder="e.g. 100 (kg/units)"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1F2937]">Delivery Destinations</h2>
            <div className="space-x-2">
              <button type="button" className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-200" onClick={handleAddDestination}>+ Add Location</button>
              <button type="button" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-50" onClick={handleReset}>Reset All</button>
            </div>
          </div>
          {errors.destinations && (errors.destinations as any).global && (
            <div className="text-sm font-medium text-red-600 mb-4">{(errors.destinations as any).global.name}</div>
          )}
          
          <div className="space-y-4">
            {form.destinations.map((d, i) => {
              const derrs = (errors.destinations as any) || {}
              return (
                <div key={d.id} className="relative rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-colors hover:border-[#71C168]/50">
                  <div className="flex justify-between items-center mb-4">
                    <div className="font-bold text-[#1F2937] flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#71C168]/20 text-[10px] text-[#71C168]">{i + 1}</span>
                      Location
                    </div>
                    <button type="button" className="text-xs font-semibold text-red-500 hover:text-red-700 hover:underline" onClick={() => handleRemoveDestination(d.id)}>Remove</button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="mb-1.5 block text-xs font-semibold text-gray-500">Name / Address</label>
                      <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20" placeholder="e.g. Warehouse A" value={d.name} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, name: ev.target.value } : x) }))} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="mb-1.5 block text-xs font-semibold text-gray-500">Delivery Priority</label>
                      <select className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20" value={d.urgency} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, urgency: ev.target.value as any } : x) }))}>
                        <option value="normal">Normal</option>
                        <option value="high">High (Urgent)</option>
                        <option value="low">Low (Flexible)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-500">Latitude</label>
                      <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20" placeholder="e.g. -6.200" value={d.lat} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, lat: ev.target.value } : x) }))} />
                      {derrs[d.id] && derrs[d.id].lat && <div className="mt-1 text-xs text-red-600 font-medium">{derrs[d.id].lat}</div>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-500">Longitude</label>
                      <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20" placeholder="e.g. 106.816" value={d.lon} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, lon: ev.target.value } : x) }))} />
                      {derrs[d.id] && derrs[d.id].lon && <div className="mt-1 text-xs text-red-600 font-medium">{derrs[d.id].lon}</div>}
                    </div>
                    <div className="col-span-2">
                      <label className="mb-1.5 block text-xs font-semibold text-gray-500">Demand Volume (Load size)</label>
                      <input className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#71C168] focus:outline-none focus:ring-2 focus:ring-[#71C168]/20" placeholder="e.g. 30 (Keep 0 for starting Warehouse)" value={d.demand} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, demand: ev.target.value } : x) }))} />
                      {derrs[d.id] && derrs[d.id].demand && <div className="mt-1 text-xs text-red-600 font-medium">{derrs[d.id].demand}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="pt-6 mt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-600">Total network demand: <span className="font-bold text-[#1F2937] ml-1">{totalDemand}</span></div>
            {errorMsg && <div className="text-sm font-medium text-red-600">{errorMsg}</div>}
          </div>
          <button 
            type="submit" 
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-bold text-white bg-[#71C168] hover:bg-[#5da655] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#71C168] transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
            disabled={loading}
          >
            {loading ? "Running AI Optimizer..." : "Generate Optimized Routes"}
          </button>
        </div>
      </div>
    </form>
  );
}
