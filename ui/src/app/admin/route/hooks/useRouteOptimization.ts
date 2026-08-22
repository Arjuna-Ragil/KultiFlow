import { useState, useEffect, useMemo } from "react";
import type { FormState, ValidationError, Destination } from "../types";

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

export function useRouteOptimization() {
  const [form, setForm] = useState<FormState>(sampleInitialState)
  const [errors, setErrors] = useState<ValidationError>({})
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
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
      const res = await fetch("http://localhost:8000/api/route/optimize", {
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

  return {
    form,
    setForm,
    errors,
    loading,
    results,
    setResults,
    errorMsg,
    totalDemand,
    handleAddDestination,
    handleRemoveDestination,
    handleReset,
    handleSubmit,
  }
}
