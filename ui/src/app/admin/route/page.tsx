

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
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-semibold mb-4">Routing — Optimize</h1>
      <div className="grid grid-cols-12 gap-6">
        <form className="col-span-12 md:col-span-5 bg-white p-4 rounded shadow" onSubmit={handleSubmit}>
          <h2 className="font-medium mb-3">Input</h2>
          <div className="space-y-3">
            <label className="block">
              <div className="text-sm text-gray-600">Number of vehicles</div>
              <input
                type="number"
                min={1}
                className="mt-1 block w-full border rounded px-2 py-1"
                value={form.vehicleCount}
                onChange={(ev) => setForm((cur) => ({ ...cur, vehicleCount: Math.max(1, Number(ev.target.value) || 1) }))}
              />
            </label>

            <div>
              <div className="text-sm text-gray-600 mb-1">Vehicle capacities</div>
              {errors.capacities && <div className="text-sm text-red-600 mb-1">{errors.capacities}</div>}
              <div className="grid grid-cols-2 gap-2">
                {form.capacities.map((c, idx) => (
                  <input
                    key={idx}
                    type="number"
                    min={0}
                    className="border rounded px-2 py-1"
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

            <div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 mb-1">Destinations</div>
                <div className="space-x-2">
                  <button type="button" className="px-3 py-1 rounded bg-gray-100 text-sm" onClick={handleAddDestination}>Add</button>
                  <button type="button" className="px-3 py-1 rounded bg-gray-100 text-sm" onClick={handleReset}>Reset</button>
                </div>
              </div>
              {errors.destinations && (errors.destinations as any).global && (
                <div className="text-sm text-red-600">{(errors.destinations as any).global.name}</div>
              )}
              <div className="space-y-3 mt-2">
                {form.destinations.map((d, i) => {
                  const derrs = (errors.destinations as any) || {}
                  return (
                    <div key={d.id} className="border rounded p-2">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">Destination {i + 1}</div>
                        <div className="space-x-2">
                          <button type="button" className="text-sm text-red-600" onClick={() => handleRemoveDestination(d.id)}>Remove</button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <input className="w-full border px-2 py-1 rounded" placeholder="Name" value={d.name} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, name: ev.target.value } : x) }))} />
                        </div>
                        <div>
                          <select className="w-full border px-2 py-1 rounded" value={d.urgency} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, urgency: ev.target.value as any } : x) }))}>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="low">Low</option>
                          </select>
                        </div>
                        <div>
                          <input className="w-full border px-2 py-1 rounded" placeholder="Latitude" value={d.lat} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, lat: ev.target.value } : x) }))} />
                          {derrs[d.id] && derrs[d.id].lat && <div className="text-sm text-red-600">{derrs[d.id].lat}</div>}
                        </div>
                        <div>
                          <input className="w-full border px-2 py-1 rounded" placeholder="Longitude" value={d.lon} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, lon: ev.target.value } : x) }))} />
                          {derrs[d.id] && derrs[d.id].lon && <div className="text-sm text-red-600">{derrs[d.id].lon}</div>}
                        </div>
                        <div>
                          <input className="w-full border px-2 py-1 rounded" placeholder="Demand" value={d.demand} onChange={(ev) => setForm((cur) => ({ ...cur, destinations: cur.destinations.map((x) => x.id === d.id ? { ...x, demand: ev.target.value } : x) }))} />
                          {derrs[d.id] && derrs[d.id].demand && <div className="text-sm text-red-600">{derrs[d.id].demand}</div>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">Total demand: {totalDemand}</div>
              <div className="space-x-2">
                <button type="submit" className="px-4 py-1 bg-blue-600 text-white rounded" disabled={loading}>{loading ? "Optimizing…" : "Optimize"}</button>
                <button type="button" className="px-3 py-1 border rounded" onClick={() => { setResults(null); setErrorMsg(null); }}>Clear results</button>
              </div>
            </div>
            {errorMsg && <div className="text-sm text-red-600">{errorMsg}</div>}
          </div>
        </form>

        <div className="col-span-12 md:col-span-7">
          <div className="bg-white p-4 rounded shadow min-h-[300px]">
            <h2 className="font-medium mb-3">Results</h2>
            {!results && !loading && (
              <div className="text-sm text-gray-600">No results yet. Submit the form to run the optimizer.</div>
            )}
            {loading && (
              <div className="text-sm text-gray-600">Waiting for response…</div>
            )}
            {results && (
              <div className="space-y-4">
                <div className="p-3 border rounded">
                  <div className="flex justify-between">
                    <div><strong>Status:</strong> {results.status || "—"}</div>
                    <div><strong>Total travel time:</strong> {results.total_waktu_menit ?? "—"} min</div>
                  </div>
                  <div className="mt-2"><strong>Total load:</strong> {results.total_muatan ?? "—"}</div>
                  {results.toko_di_drop && results.toko_di_drop.length > 0 && (
                    <div className="mt-2">
                      <strong>Dropped destinations:</strong>
                      <ul className="list-disc ml-5">
                        {results.toko_di_drop.map((dn: string) => (<li key={dn} className="text-red-600">{dn}</li>))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {(results.rute_kendaraan || []).map((v: any, idx: number) => (
                    <div key={idx} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Vehicle {v.id_kendaraan ?? idx + 1}</div>
                        <div className="text-sm text-gray-600">Load: {v.total_muatan ?? "—"} / Time: {v.waktu_tempuh_kendaraan ?? "—"}m</div>
                      </div>
                      <div className="mt-2 space-y-1">
                        {(v.detail_rute || []).map((r: any, i: number) => (
                          <div key={i} className={`p-2 rounded ${results.toko_di_drop?.includes(r.lokasi) ? "line-through text-red-600" : ""}`}>
                            <div className="font-medium">{r.lokasi}</div>
                            <div className="text-xs text-gray-600">Arrival: {r.tiba_menit_ke}m | Load: {r.muatan_bawaan}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {results.pesan_dispatcher_ai && (
                  <div className="p-3 border rounded bg-blue-50">
                    <strong>AI Dispatcher Notes</strong>
                    <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{results.pesan_dispatcher_ai}</div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button className="px-3 py-1 border rounded" onClick={() => { setResults(null); }}>Clear results</button>
                  <button className="px-3 py-1 bg-blue-600 text-white rounded" onClick={() => handleSubmit()}>Retry</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}