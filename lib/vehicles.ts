// lib/vehicles.ts
import { apiCall, API_CONFIG } from './api'
import { Vehicle, CreateVehiclePayload, UpdateVehiclePayload } from '../types/vehicle'

const base = API_CONFIG.BASE_URL

export async function getVehicles(params?: Record<string, any>) {
  // params can be serialized by the caller or extended here
  return (await apiCall(`/api/vehicles${params ? '?' + new URLSearchParams(params).toString() : ''}`)) as {
    items: Vehicle[]
    total: number
  }
}

export async function getVehicle(id: string) {
  return (await apiCall(`/api/vehicles/${id}`)) as Vehicle
}

export async function createVehicle(payload: CreateVehiclePayload) {
  return (await apiCall(`/api/vehicles`, { method: 'POST', body: JSON.stringify(payload) })) as Vehicle
}

export async function updateVehicle(id: string, payload: UpdateVehiclePayload) {
  return (await apiCall(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(payload) })) as Vehicle
}

export async function deleteVehicle(id: string) {
  return await apiCall(`/api/vehicles/${id}`, { method: 'DELETE' })
}
