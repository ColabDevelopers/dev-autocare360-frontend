import { Vehicle } from '@/types/vehicle'
import { apiCall } from './api'

// ✅ Exported functions (these must match what hooks use)
export async function listVehicles() {
  console.log('🌍 Fetching vehicles from: /api/vehicles')
  try {
    const result = await apiCall('/api/vehicles', { method: 'GET' })
    console.log('Vehicle data received:', result)
    return result
  } catch (error) {
    console.error('Failed to fetch vehicles:', error)
    throw error
  }
}

export async function getVehicle(id: string) {
  try {
    return await apiCall(`/api/vehicles/${id}`, { method: 'GET' })
  } catch (error) {
    console.error(`Failed to fetch vehicle ${id}:`, error)
    throw error
  }
}

export async function createVehicle(data: Partial<Vehicle>) {
  console.log('📝 Creating vehicle with data:', data)
  try {
    const result = await apiCall('/api/vehicles', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    console.log('✅ Vehicle created successfully:', result)
    return result
  } catch (error: any) {
    console.error('❌ Failed to create vehicle:', error)
    // Extract error message from API response if available
    const errorMessage = error?.message || 'Failed to create vehicle'
    throw new Error(errorMessage)
  }
}

export async function updateVehicle(id: string | number, data: Partial<Vehicle>) {
  console.log(`📝 Updating vehicle ${id} with data:`, data)
  try {
    const result = await apiCall(`/api/vehicles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    console.log('✅ Vehicle updated successfully:', result)
    return result
  } catch (error: any) {
    console.error(`❌ Failed to update vehicle ${id}:`, error)
    const errorMessage = error?.message || 'Failed to update vehicle'
    throw new Error(errorMessage)
  }
}

export async function deleteVehicle(id: number | string) {
  console.log(`🗑️ Deleting vehicle ${id}`)
  try {
    await apiCall(`/api/vehicles/${id}`, { method: 'DELETE' })
    console.log('✅ Vehicle deleted successfully')
    return true
  } catch (error: any) {
    console.error(`❌ Failed to delete vehicle ${id}:`, error)
    const errorMessage = error?.message || 'Failed to delete vehicle'
    throw new Error(errorMessage)
  }
}
