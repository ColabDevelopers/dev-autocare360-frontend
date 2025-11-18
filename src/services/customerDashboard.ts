import { apiCall } from '@/lib/api'

export interface DashboardStats {
  activeServices: number
  completedServices: number
  totalVehicles: number
  upcomingAppointments: number
}

export interface ActiveService {
  id: string | number
  vehicleInfo: string
  serviceType: string
  progress: number
  status: 'IN_PROGRESS' | 'PENDING' | 'COMPLETED' | 'DELAYED'
  estimatedCompletion?: string
  currentStep?: string
  lastUpdate?: string
  vehicleId?: string | number
  serviceName?: string
}

export interface UpcomingAppointment {
  id: string | number
  service: string
  date: string
  time: string
  vehicle: string
  vehicleId?: string | number
  status?: string
  serviceType?: string
  appointmentDate?: string
}

export interface NextService {
  date: string
  service: string
  time?: string
}

export interface RecentNotification {
  id: string | number
  message: string
  time: string
  type: 'success' | 'info' | 'update' | 'warning'
  createdAt?: string
  title?: string
}

/**
 * Get customer dashboard statistics
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    // Fetch from multiple endpoints and combine
    const [services, appointments, vehicles] = await Promise.all([
      apiCall('/api/services', { method: 'GET' }).catch(() => ({ items: [] })),
      apiCall('/api/appointments/stats', { method: 'GET' }).catch(() => ({})),
      apiCall('/api/vehicles', { method: 'GET' }).catch(() => ({ items: [] })),
    ])

    const serviceItems = Array.isArray(services) ? services : services?.items || []
    const vehicleItems = Array.isArray(vehicles) ? vehicles : vehicles?.items || []
    
    return {
      activeServices: serviceItems.filter((s: any) => 
        s.status === 'IN_PROGRESS' || s.status === 'PENDING' || s.status === 'active'
      ).length,
      completedServices: appointments?.completed || serviceItems.filter((s: any) => 
        s.status === 'COMPLETED' || s.status === 'completed'
      ).length,
      totalVehicles: vehicleItems.length,
      upcomingAppointments: appointments?.upcoming || 0,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

/**
 * Get active services with live progress for the customer
 */
export async function getActiveServices(): Promise<ActiveService[]> {
  try {
    const data = await apiCall('/api/services', { method: 'GET' })
    const items = Array.isArray(data) ? data : data?.items || []
    
    // Filter for active/in-progress services and map to ActiveService format
    return items
      .filter((s: any) => 
        s.status === 'IN_PROGRESS' || s.status === 'PENDING' || s.status === 'active'
      )
      .map((s: any) => ({
        id: s.id,
        vehicleInfo: s.vehicleInfo || `Vehicle ${s.vehicleId}`,
        serviceType: s.name || s.serviceName || s.type || 'Service',
        progress: s.progress || 0,
        status: s.status || 'PENDING',
        estimatedCompletion: s.estimatedCompletion || s.scheduledAt || '',
        currentStep: s.currentStep || s.description || 'In progress',
        lastUpdate: s.updatedAt || s.lastUpdate || new Date().toISOString(),
        vehicleId: s.vehicleId,
        serviceName: s.name || s.serviceName,
      }))
  } catch (error) {
    console.error('Error fetching active services:', error)
    return []
  }
}

/**
 * Get upcoming appointments for the customer
 */
export async function getUpcomingAppointments(): Promise<UpcomingAppointment[]> {
  try {
    const data = await apiCall('/api/appointments?status=upcoming', { method: 'GET' })
    const items = Array.isArray(data) ? data : data?.items || []
    
    return items.map((a: any) => ({
      id: a.id,
      service: a.serviceName || a.service || a.type || 'Service',
      date: a.appointmentDate || a.scheduledAt || a.date || '',
      time: a.appointmentTime || a.time || new Date(a.appointmentDate || a.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      vehicle: a.vehicleInfo || `Vehicle ${a.vehicleId}`,
      vehicleId: a.vehicleId,
      status: a.status,
      serviceType: a.serviceType || a.type,
      appointmentDate: a.appointmentDate || a.scheduledAt,
    }))
  } catch (error) {
    console.error('Error fetching upcoming appointments:', error)
    return []
  }
}

/**
 * Get next service appointment
 */
export async function getNextService(): Promise<NextService | null> {
  try {
    const data = await apiCall('/api/appointments?status=upcoming', { method: 'GET' })
    const items = Array.isArray(data) ? data : data?.items || []
    
    if (items.length === 0) return null
    
    // Sort by date and get the first one
    const sorted = items.sort((a: any, b: any) => {
      const dateA = new Date(a.appointmentDate || a.scheduledAt || a.date)
      const dateB = new Date(b.appointmentDate || b.scheduledAt || b.date)
      return dateA.getTime() - dateB.getTime()
    })
    
    const next = sorted[0]
    return {
      date: next.appointmentDate || next.scheduledAt || next.date,
      service: next.serviceName || next.service || next.type || 'Service',
      time: next.appointmentTime || next.time || '',
    }
  } catch (error) {
    console.error('Error fetching next service:', error)
    return null
  }
}

/**
 * Get recent notifications/updates for the customer
 */
export async function getRecentNotifications(): Promise<RecentNotification[]> {
  try {
    // Try to get notifications from appointments or services updates
    const [appointments, services] = await Promise.all([
      apiCall('/api/appointments', { method: 'GET' }).catch(() => ({ items: [] })),
      apiCall('/api/services', { method: 'GET' }).catch(() => ({ items: [] })),
    ])
    
    const appointmentItems = Array.isArray(appointments) ? appointments : appointments?.items || []
    const serviceItems = Array.isArray(services) ? services : services?.items || []
    
    const notifications: RecentNotification[] = []
    
    // Create notifications from recent appointments
    appointmentItems.slice(0, 3).forEach((a: any) => {
      notifications.push({
        id: `apt-${a.id}`,
        message: `Appointment ${a.status || 'scheduled'}: ${a.serviceName || a.service || 'Service'}`,
        time: getRelativeTime(a.appointmentDate || a.scheduledAt || a.createdAt),
        type: a.status === 'COMPLETED' ? 'success' : 'info',
        createdAt: a.appointmentDate || a.scheduledAt || a.createdAt,
        title: a.serviceName || a.service,
      })
    })
    
    // Create notifications from recent service updates
    serviceItems.slice(0, 2).forEach((s: any) => {
      notifications.push({
        id: `srv-${s.id}`,
        message: `Service ${s.status || 'update'}: ${s.name || s.serviceName || 'Service'}`,
        time: getRelativeTime(s.updatedAt || s.createdAt),
        type: s.status === 'COMPLETED' ? 'success' : 'update',
        createdAt: s.updatedAt || s.createdAt,
        title: s.name || s.serviceName,
      })
    })
    
    // Sort by date and return top 5
    return notifications
      .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
      .slice(0, 5)
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return []
  }
}

/**
 * Helper to convert date to relative time
 */
function getRelativeTime(dateString: string): string {
  if (!dateString) return 'Recently'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
  
  return date.toLocaleDateString()
}

/**
 * Search across customer's services, appointments, and vehicles
 */
export async function searchDashboard(query: string): Promise<{
  services: ActiveService[]
  appointments: UpcomingAppointment[]
  vehicles: any[]
}> {
  try {
    const lowerQuery = query.toLowerCase()
    
    // Fetch all data
    const [servicesData, appointmentsData, vehiclesData] = await Promise.all([
      apiCall('/api/services', { method: 'GET' }).catch(() => ({ items: [] })),
      apiCall('/api/appointments', { method: 'GET' }).catch(() => ({ items: [] })),
      apiCall('/api/vehicles', { method: 'GET' }).catch(() => ({ items: [] })),
    ])
    
    const allServices = Array.isArray(servicesData) ? servicesData : servicesData?.items || []
    const allAppointments = Array.isArray(appointmentsData) ? appointmentsData : appointmentsData?.items || []
    const allVehicles = Array.isArray(vehiclesData) ? vehiclesData : vehiclesData?.items || []
    
    // Filter services
    const filteredServices = allServices
      .filter((s: any) => 
        (s.name?.toLowerCase().includes(lowerQuery)) ||
        (s.serviceName?.toLowerCase().includes(lowerQuery)) ||
        (s.type?.toLowerCase().includes(lowerQuery)) ||
        (s.description?.toLowerCase().includes(lowerQuery)) ||
        (s.status?.toLowerCase().includes(lowerQuery))
      )
      .map((s: any) => ({
        id: s.id,
        vehicleInfo: s.vehicleInfo || `Vehicle ${s.vehicleId}`,
        serviceType: s.name || s.serviceName || s.type || 'Service',
        progress: s.progress || 0,
        status: s.status || 'PENDING',
        estimatedCompletion: s.estimatedCompletion || s.scheduledAt || '',
        currentStep: s.currentStep || s.description || 'In progress',
        lastUpdate: s.updatedAt || s.lastUpdate || new Date().toISOString(),
        vehicleId: s.vehicleId,
        serviceName: s.name || s.serviceName,
      }))
    
    // Filter appointments
    const filteredAppointments = allAppointments
      .filter((a: any) => 
        (a.serviceName?.toLowerCase().includes(lowerQuery)) ||
        (a.service?.toLowerCase().includes(lowerQuery)) ||
        (a.type?.toLowerCase().includes(lowerQuery)) ||
        (a.status?.toLowerCase().includes(lowerQuery)) ||
        (a.vehicleInfo?.toLowerCase().includes(lowerQuery))
      )
      .map((a: any) => ({
        id: a.id,
        service: a.serviceName || a.service || a.type || 'Service',
        date: a.appointmentDate || a.scheduledAt || a.date || '',
        time: a.appointmentTime || a.time || '',
        vehicle: a.vehicleInfo || `Vehicle ${a.vehicleId}`,
        vehicleId: a.vehicleId,
        status: a.status,
        serviceType: a.serviceType || a.type,
        appointmentDate: a.appointmentDate || a.scheduledAt,
      }))
    
    // Filter vehicles
    const filteredVehicles = allVehicles.filter((v: any) => 
      (v.make?.toLowerCase().includes(lowerQuery)) ||
      (v.model?.toLowerCase().includes(lowerQuery)) ||
      (v.year?.toString().includes(query)) ||
      (v.licensePlate?.toLowerCase().includes(lowerQuery)) ||
      (v.vin?.toLowerCase().includes(lowerQuery))
    )
    
    return {
      services: filteredServices,
      appointments: filteredAppointments,
      vehicles: filteredVehicles,
    }
  } catch (error) {
    console.error('Error searching dashboard:', error)
    return { services: [], appointments: [], vehicles: [] }
  }
}
