import { apiCall } from '@/lib/api'

export interface Appointment {
  id: number | string
  service: string
  date: string
  time: string
  vehicle: string
  vehicleId?: string
  status?: string
  customerId?: string
}

export interface AppointmentStats {
  upcoming: number
  completed: number
  nextAppointment?: {
    service: string
    date: string
    time: string
  }
}

/**
 * Get appointments for the current user (customer)
 * Returns all appointments including upcoming and past
 */
export async function getMyAppointments(params?: Record<string, any>): Promise<Appointment[]> {
  const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
  const data = await apiCall(`/api/appointments${queryString}`, { method: 'GET' })
  return Array.isArray(data) ? data : data?.items || []
}

/**
 * Get upcoming appointments for the current user
 */
export async function getUpcomingAppointments(): Promise<Appointment[]> {
  const data = await apiCall('/api/appointments?status=upcoming', { method: 'GET' })
  return Array.isArray(data) ? data : data?.items || []
}

/**
 * Get appointment statistics for the current user
 */
export async function getAppointmentStats(): Promise<AppointmentStats> {
  try {
    const data = await apiCall('/api/appointments/stats', { method: 'GET' })
    return data as AppointmentStats
  } catch (error) {
    console.error('Error fetching appointment stats:', error)
    // Return default stats if endpoint doesn't exist
    return {
      upcoming: 0,
      completed: 0,
    }
  }
}

/**
 * Create a new appointment
 */
export async function createAppointment(payload: {
  vehicleId: string
  serviceType: string
  date: string
  time: string
  notes?: string
}): Promise<Appointment> {
  const data = await apiCall('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data as Appointment
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id: string | number): Promise<void> {
  await apiCall(`/api/appointments/${id}`, {
    method: 'DELETE',
  })
}
