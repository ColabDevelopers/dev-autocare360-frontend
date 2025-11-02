import { apiCall } from '@/lib/api'

export interface WorkloadResponse {
  employeeId: number
  name: string
  email: string
  department: string
  activeAppointments: number
  activeProjects: number
  hoursLoggedThisWeek: number
  hoursLoggedThisMonth: number
  capacityUtilization: number
  status: 'available' | 'busy' | 'overloaded'
  upcomingTasks: Task[]
}

export interface Task {
  id: number
  workItemId: number
  title: string
  type: 'appointment' | 'project'
  scheduledDate: string
  estimatedHours: number
  status: string
  customerName: string
}

export interface CapacityMetrics {
  totalEmployees: number
  availableEmployees: number
  busyEmployees: number
  overloadedEmployees: number
  averageCapacity: number
  totalActiveWorkItems: number
}

export interface AssignTaskPayload {
  workItemId: number
  employeeId: number
  roleOnJob?: string
}

// Get all employees workload
export async function getAllWorkloads(): Promise<WorkloadResponse[]> {
  try {
    const data = await apiCall('/admin/workload/employees', { method: 'GET' })
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch workloads:', error)
    return []
  }
}

// Get single employee workload
export async function getEmployeeWorkload(employeeId: number): Promise<WorkloadResponse | null> {
  try {
    const data = await apiCall(`/admin/workload/employee/${employeeId}`, { method: 'GET' })
    return data as WorkloadResponse
  } catch (error) {
    console.error('Failed to fetch employee workload:', error)
    return null
  }
}

// Get capacity metrics
export async function getCapacityMetrics(): Promise<CapacityMetrics> {
  try {
    const data = await apiCall('/admin/workload/capacity', { method: 'GET' })
    return data as CapacityMetrics
  } catch (error) {
    console.error('Failed to fetch capacity metrics:', error)
    return {
      totalEmployees: 0,
      availableEmployees: 0,
      busyEmployees: 0,
      overloadedEmployees: 0,
      averageCapacity: 0,
      totalActiveWorkItems: 0,
    }
  }
}

// Assign task to employee
export async function assignTask(payload: AssignTaskPayload): Promise<boolean> {
  try {
    await apiCall('/admin/workload/assign', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return true
  } catch (error) {
    console.error('Failed to assign task:', error)
    throw error
  }
}

// Get employee availability
export async function getEmployeeAvailability(): Promise<any[]> {
  try {
    const data = await apiCall('/admin/workload/availability', { method: 'GET' })
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    return []
  }
}