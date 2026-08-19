

"use client"

import React, { useEffect, useMemo, useState } from "react"

type Destination = {
  id: string
  name: string
  lat: string
  lon: string
  urgency: "low" | "normal" | "high"
  demand: string
}

type FormState = {
  vehicleCount: number
  capacities: string[]
  destinations: Destination[]
}

type ValidationError = {
  capacities?: string
  destinations?: Record<string, Partial<Record<keyof Destination, string>>>
}

const sampleInitialState: FormState = {
  vehicleCount: 2,
  capacities: ["100", "100"],
  destinations: [
    { id: "d1", name: "Warehouse", lat: "-6.200000", lon: "106.816666", urgency: "normal", demand: "0" },
    { id: "d2", name: "Client A", lat: "-6.21", lon: "106.82", urgency: "high", demand: "30" },
  ],
}

const defaultNewDestination = (id: string): Destination => ({ id, name: "", lat: "", lon: "", urgency: "normal", demand: "0" })

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}

export default function Page() {
  const [form, setForm] = useState<FormState>(sampleInitialState)
  const [errors, setErrors] = useState<ValidationError>({})
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    // Ensure capacities length equals vehicleCount
    setForm((cur) => {
      const wanted = cur.vehicleCount
      const caps = [...cur.capacities]
      if (caps.length < wanted) {
        while (caps.length < wanted) caps.push("0")
      } else if (caps.length > wanted) {
        caps.length = wanted
      }
      return { ...cur, capacities: caps }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.vehicleCount])

  const validate = (state: FormState) => {
    const e: ValidationError = {}
    if (state.capacities.length !== state.vehicleCount) {
      e.capacities = "Number of capacities must match vehicle count"
    }
    if (!state.destinations || state.destinations.length === 0) {
      e.destinations = { global: { name: "At least one destination is required" } } as any
    } else {
      const destErrors: Record<string, any> = {}
      state.destinations.forEach((d) => {
        const de: Partial<Record<keyof Destination, string>> = {}
        const lat = parseFloat(d.lat)
        const lon = parseFloat(d.lon)
        const demand = Number(d.demand)
        if (Number.isNaN(lat) || lat < -90 || lat > 90) de.lat = "Latitude must be between -90 and 90"
        if (Number.isNaN(lon) || lon < -180 || lon > 180) de.lon = "Longitude must be between -180 and 180"
        if (Number.isNaN(demand) || demand < 0) de.demand = "Demand must be a non-negative number"
        if (Object.keys(de).length > 0) destErrors[d.id] = de
      })
      if (Object.keys(destErrors).length > 0) e.destinations = destErrors
    }
    // capacities non-negative
    const capErr = state.capacities.find((c) => Number.isNaN(Number(c)) || Number(c) < 0)
    if (capErr !== undefined) {
      e.capacities = "Capacities must be non-negative numbers"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAddDestination = () => {
    setForm((cur) => ({ ...cur, destinations: [...cur.destinations, defaultNewDestination(uid("d"))] }))
  }

  const handleRemoveDestination = (id: string) => {
    setForm((cur) => ({ ...cur, destinations: cur.destinations.filter((d) => d.id !== id) }))
  }

  const handleReset = () => {
    setForm(sampleInitialState)
    setErrors({})
    setResults(null)
    setErrorMsg(null)
  }

  const toPayload = (state: FormState) => {
    const urgencyMap: Record<string, number> = { low: 0.3, normal: 0.5, high: 0.8 }
    return {
      num_vehicles: state.vehicleCount,
      vehicle_capacities: state.capacities.map((c) => Number(c)),
      destinations: state.destinations.map((d) => ({
        nama: d.name,
        lat: Number(d.lat),
        lon: Number(d.lon),
        urgency: Number(d.demand) === 0 ? null : urgencyMap[d.urgency] ?? 0.5,
        demand: Number(d.demand),
      })),
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setResults(null)
    setErrorMsg(null)
    const ok = validate(form)
    if (!ok) return
    setLoading(true)
    try {
      const payload = toPayload(form)
      const res = await fetch("http://localhost:8000/optimize-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || res.statusText)
      }
      const data = await res.json()
      setResults(data)
    } catch (err: any) {
      setErrorMsg(err?.message || "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const totalDemand = useMemo(() => form.destinations.reduce((s, d) => s + Number(d.demand || 0), 0), [form.destinations])

  return (
    <div className="min-h-full bg-gray-50">
      <div className="mx-auto w-full max-w-7xl space-y-8 p-6 sm:p-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#71C168]">
            Routing Optimization
          </h1>
          <p className="mt-1.5 text-sm text-gray-500">
            Configure your fleet and delivery destinations below to calculate the most efficient routes.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-8 items-start">
          <form className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs" onSubmit={handleSubmit}>
            <h2 className="text-lg font-bold text-[#1F2937] mb-4">Fleet & Delivery Parameters</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Number of vehicles
                </label>
                <input
                  type="number"
                  min={1}
                  className="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#1F2937] transition-all focus:border-[#71C168] focus:outline-none focus:ring-1 focus:ring-[#71C168]"
                  value={form.vehicleCount}
                  onChange={(ev) => setForm((cur) => ({ ...cur, vehicleCount: Math.max(1, Number(ev.target.value) || 1) }))}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  Vehicle capacities (kg)
                </label>
                {errors.capacities && <div className="text-xs font-semibold text-red-600 mb-1.5">{errors.capacities}</div>}
                <div className="grid grid-cols-2 gap-2.5">
                  {form.capacities.map((c, idx) => (
                    <input
                      key={idx}
                      type="number"
                      min={0}
                      className="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-[#1F2937] transition-all focus:border-[#71C168] focus:outline-none focus:ring-1 focus:ring-[#71C168]"
                      value={c}
                      onChange={(ev) => setForm((cur) => {
                        const caps = [...cur.capacities]
                        caps[idx] = ev.target.value
                        return { ...cur, capacities: caps }
                      })}
                      placeholder={`Vehicle ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Destinations</span>
                  <div className="space-x-2">
                    <button
                      type="button"
                      className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                      onClick={handleAddDestination}
                    >
                      + Add Location
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 transition-colors"
                      onClick={handleReset}
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {errors.destinations && (errors.destinations as any).global && (
                  <div className="text-xs font-semibold text-red-600 mb-2">{(errors.destinations as any).global.name}</div>
                )}

                <div className="space-y-3 mt-2 max-h-96 overflow-y-auto pr-1">
                  {form.destinations.map((d, i) => {
                    const derrs = (errors.destinations as any) || {}
                    return (
                      <div key={d.id} className="rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#1F2937]">Destination #{i + 1}</span>
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:underline"
                            onClick={() => handleRemoveDestination(d.id)}
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#1F2937] focus:border-[#71C168] focus:outline-none"
                              placeholder="Name"
                              value={d.name}
                              onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, name: ev.target.value } : x) }))}
                            />
                          </div>
                          <div>
                            <select
                              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#1F2937] focus:border-[#71C168] focus:outline-none"
                              value={d.urgency}
                              onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, urgency: ev.target.value as any } : x) }))}
                            >
                              <option value="normal">Priority: Normal</option>
                              <option value="high">Priority: High</option>
                              <option value="low">Priority: Low</option>
                            </select>
                          </div>
                          <div>
                            <input
                              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#1F2937] focus:border-[#71C168] focus:outline-none"
                              placeholder="Latitude"
                              value={d.lat}
                              onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, lat: ev.target.value } : x) }))}
                            />
                            {derrs[d.id] && derrs[d.id].lat && <div className="text-[10px] text-red-600 mt-0.5">{derrs[d.id].lat}</div>}
                          </div>
                          <div>
                            <input
                              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#1F2937] focus:border-[#71C168] focus:outline-none"
                              placeholder="Longitude"
                              value={d.lon}
                              onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, lon: ev.target.value } : x) }))}
                            />
                            {derrs[d.id] && derrs[d.id].lon && <div className="text-[10px] text-red-600 mt-0.5">{derrs[d.id].lon}</div>}
                          </div>
                          <div className="col-span-2">
                            <input
                              className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-[#1F2937] focus:border-[#71C168] focus:outline-none"
                              placeholder="Demand (Units/Kg)"
                              value={d.demand}
                              onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, demand: ev.target.value } : x) }))}
                            />
                            {derrs[d.id] && derrs[d.id].demand && <div className="text-[10px] text-red-600 mt-0.5">{derrs[d.id].demand}</div>}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-gray-500">Total Demand: <strong className="text-[#1F2937]">{totalDemand}</strong></span>
                <div className="space-x-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#71C168] px-4 py-2 text-sm font-bold text-white shadow-xs hover:bg-[#62aa5a] transition-all disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? "Optimizing…" : "Optimize Routes"}
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    onClick={() => { setResults(null); setErrorMsg(null); }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              {errorMsg && <div className="text-xs font-semibold text-red-600 mt-2">{errorMsg}</div>}
            </div>
          </form>

          <div className="col-span-12 lg:col-span-7">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xs min-h-[300px]">
              <h2 className="text-lg font-bold text-[#1F2937] mb-4">Calculated Optimization Results</h2>
              {!results && !loading && (
                <div className="py-16 text-center text-sm text-gray-400">
                  No calculation results yet. Configure parameters and click "Optimize Routes".
                </div>
              )}
              {loading && (
                <div className="py-16 text-center text-sm font-semibold text-[#71C168] animate-pulse">
                  Analyzing coordinates & calculating optimal vehicle distribution…
                </div>
              )}
              {results && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs uppercase font-bold text-gray-400">Status</span>
                        <div className="text-sm font-bold text-[#71C168]">{results.status || "Completed"}</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs uppercase font-bold text-gray-400">Total Travel Time</span>
                        <div className="text-sm font-bold text-[#1F2937]">{results.total_waktu_menit ?? "—"} mins</div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200/60 text-xs text-gray-600">
                      <strong>Total Load:</strong> {results.total_muatan ?? "—"} kg
                    </div>
                    {results.toko_di_drop && results.toko_di_drop.length > 0 && (
                      <div className="mt-2 text-xs">
                        <strong className="text-red-600">Dropped Destinations:</strong>
                        <ul className="list-disc ml-5 mt-1 text-red-600">
                          {results.toko_di_drop.map((dn: string) => (<li key={dn}>{dn}</li>))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {(results.rute_kendaraan || []).map((v: any, idx: number) => (
                      <div key={idx} className="rounded-xl border border-gray-200 p-3.5 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                          <div className="font-bold text-sm text-[#1F2937]">Vehicle #{v.id_kendaraan ?? idx + 1}</div>
                          <span className="text-xs font-semibold text-gray-500">{v.total_muatan ?? "—"} kg • {v.waktu_tempuh_kendaraan ?? "—"}m</span>
                        </div>
                        <div className="mt-2.5 space-y-1.5">
                          {(v.detail_rute || []).map((r: any, i: number) => (
                            <div key={i} className={`rounded-lg p-2 text-xs ${results.toko_di_drop?.includes(r.lokasi) ? "line-through text-red-600 bg-red-50" : "bg-gray-50 text-gray-700"}`}>
                              <div className="font-semibold">{r.lokasi}</div>
                              <div className="text-[10px] text-gray-400 mt-0.5">Arrival: {r.tiba_menit_ke}m | Load: {r.muatan_bawaan}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {results.pesan_dispatcher_ai && (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                      <strong className="text-xs font-bold uppercase tracking-wider text-blue-700">AI Dispatcher Recommendations</strong>
                      <div className="text-xs text-gray-700 mt-1.5 leading-relaxed whitespace-pre-wrap">{results.pesan_dispatcher_ai}</div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <button
                      type="button"
                      className="rounded-xl border border-gray-200 px-3.5 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                      onClick={() => { setResults(null); }}
                    >
                      Clear Results
                    </button>
                    <button
                      type="button"
                      className="rounded-xl bg-[#71C168] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#62aa5a]"
                      onClick={() => handleSubmit()}
                    >
                      Recalculate
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}