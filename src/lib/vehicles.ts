import { Vehicle } from '@/types/vehicle'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE

console.log('🚀 API_BASE loaded:', API_BASE)

function getAuthHeaders() {
  const token = localStorage.getItem('accessToken')
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  }
}

// ✅ Exported functions (these must match what hooks use)
export async function listVehicles() {
  console.log('🌍 Fetching vehicles from:', `${API_BASE}/api/vehicles`)
  const res = await fetch(`${API_BASE}/api/vehicles`, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    console.error('Failed to fetch vehicles:', res.status)
    throw new Error(`Failed to fetch vehicles: ${res.status}`)
  }

  const result = await res.json()
  console.log('Vehicle data received:', result)
  return result
}

export async function getVehicle(id: string) {
  const res = await fetch(`${API_BASE}/api/vehicles/${id}`, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch vehicle: ${res.status}`)
  }

  return res.json()
}

export async function createVehicle(data: Partial<Vehicle>) {
  const res = await fetch(`${API_BASE}/api/vehicles`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error(`Failed to create vehicle: ${res.status}`)
  }

  return res.json()
}

export async function updateVehicle(id: string | number, data: Partial<Vehicle>) {
  const res = await fetch(`${API_BASE}/api/vehicles/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  })

  if (!res.ok) {
    throw new Error(`Failed to update vehicle: ${res.status}`)
  }

  return res.json()
}

export async function deleteVehicle(id: number | string) {
  const res = await fetch(`${API_BASE}/api/vehicles/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error(`Failed to delete vehicle (${res.status}):`, errText)
    throw new Error(`Failed to delete vehicle: ${res.status}`)
  }

  return true
}
