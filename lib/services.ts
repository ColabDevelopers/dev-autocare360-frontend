// lib/services.ts
import { apiCall } from './api'
import { Service, CreateServicePayload } from '../types/service'

export async function getServices(params?: Record<string, any>) {
  return (await apiCall(`/api/services${params ? '?' + new URLSearchParams(params).toString() : ''}`)) as {
    items: Service[]
    total: number
  }
}

export async function getService(id: string) {
  return (await apiCall(`/api/services/${id}`)) as Service
}

export async function createService(payload: CreateServicePayload): Promise<Service> {
  return (await apiCall('/api/services', {
    method: 'POST',
    body: JSON.stringify(payload),
  })) as Service
}

export async function updateService(id: string, payload: Partial<CreateServicePayload>) {
  return (await apiCall(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) })) as Service
}

export async function deleteService(id: string) {
  return await apiCall(`/api/services/${id}`, { method: 'DELETE' })
}

export async function getVehicleServices(vehicleId: string, params?: Record<string, any>) {
  return (await apiCall(`/api/services/vehicle/${vehicleId}${params ? '?' + new URLSearchParams(params).toString() : ''}`)) as Service[]
}

export async function getServiceSummary() {
  return (await apiCall('/api/services/summary')) as {
    totalServices: number
    averagePrice: number
    averageDuration: number
  }
}

