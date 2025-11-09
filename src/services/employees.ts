import { apiCall } from '@/lib/api'

export interface EmployeeResponse {
  id: number
  employeeNo: string
  email: string
  name: string
  department?: string
  status?: string
  roles?: string[]
  createdAt?: string
}

export async function listEmployees(): Promise<EmployeeResponse[]> {
  const data = await apiCall('/admin/employees', { method: 'GET' })
  return Array.isArray(data) ? data : []
}

// Public endpoint for listing employees/technicians (accessible by all authenticated users)
export async function listTechnicians(): Promise<EmployeeResponse[]> {
  try {
    console.log('Calling /api/employees endpoint...')
    const data = await apiCall('/api/employees', { method: 'GET' })
    console.log('Raw response from /api/employees:', data)
    console.log('Is array?', Array.isArray(data))
    const result = Array.isArray(data) ? data : []
    console.log('Returning:', result)
    return result
  } catch (error) {
    console.error('Failed to fetch employees from /api/employees:', error)
    return []
  }
}

export async function createEmployee(payload: {
  name: string
  email: string
  department: string
}): Promise<EmployeeResponse> {
  const data = await apiCall('/admin/employees', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data as EmployeeResponse
}

export async function getEmployee(id: number): Promise<EmployeeResponse> {
  const data = await apiCall(`/admin/employees/${id}`, { method: 'GET' })
  return data as EmployeeResponse
}

export async function updateEmployee(
  id: number,
  payload: { name?: string; department?: string; status?: 'ACTIVE' | 'INACTIVE' }
): Promise<EmployeeResponse> {
  const data = await apiCall(`/admin/employees/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return data as EmployeeResponse
}

export async function resetEmployeePassword(id: number): Promise<EmployeeResponse> {
  const data = await apiCall(`/admin/employees/${id}/reset-password`, { method: 'POST' })
  return data as EmployeeResponse
}

export async function deleteEmployee(id: number): Promise<void> {
  await apiCall(`/admin/employees/${id}`, { method: 'DELETE' })
}
