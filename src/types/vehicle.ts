// types/vehicle.ts
export interface Vehicle {
  id: string
  userId: string
  vin?: string | null
  make: string
  model: string
  year: number
  plateNumber?: string | null
  color?: string | null
  createdAt: string
  updatedAt: string
  meta?: Record<string, any>
}

export interface CreateVehiclePayload {
  vin?: string | null
  make: string
  model: string
  year: number
  plateNumber?: string | null
  color?: string | null
  notes?: string
}

export interface UpdateVehiclePayload extends Partial<CreateVehiclePayload> {}
