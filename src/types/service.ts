// types/service.ts
export interface Service {
  id: number
  vehicleId: number
  serviceName: string
  category: string
  status: string
  description: string
  attachments: string[]
  requestedAt?: string
  scheduledAt?: string
  price: number
  duration: number
}

export interface CreateServicePayload {
  vehicleId?: string | number
  name: string
  type: string
  price: number
  duration: number
  notes?: string
  status?: string
  requestedAt?: string
  scheduledAt?: string
  attachments?: string[]
}
