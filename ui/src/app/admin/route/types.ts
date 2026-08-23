export type Destination = {
  id: string
  name: string
  lat: string
  lon: string
  urgency: "low" | "normal" | "high"
  demand: string
  invoiceId?: string
}

export type FormState = {
  vehicleCount: number
  capacities: string[]
  destinations: Destination[]
}

export type ValidationError = {
  capacities?: string
  destinations?: Record<string, Partial<Record<keyof Destination, string>>>
}
