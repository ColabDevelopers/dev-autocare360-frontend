import { apiCall } from '@/lib/api'

export interface UserResponse {
  id: number
  email: string
  name: string
  roles: string[]
  status?: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
}

export async function listEmployees(): Promise<UserResponse[]> {
  try {
    const data = await apiCall('/admin/users', { method: 'GET' })
    const users = Array.isArray(data) ? data : []
    // Filter to get only employees
    return users.filter(user => 
      user.roles?.includes('EMPLOYEE') || 
      user.roles?.includes('TECHNICIAN') || 
      user.roles?.includes('MECHANIC')
    )
  } catch (error) {
    console.error('Error fetching employees from users table:', error)
    // Fallback to employees endpoint if users endpoint doesn't exist
    try {
      const employeeData = await apiCall('/admin/employees', { method: 'GET' })
      return Array.isArray(employeeData) ? employeeData.map((emp: any) => ({
        id: emp.id,
        email: emp.email,
        name: emp.name,
        roles: emp.roles || ['EMPLOYEE'],
        status: emp.status || 'ACTIVE',
        createdAt: emp.createdAt
      })) : []
    } catch (fallbackError) {
      console.error('Error fetching employees as fallback:', fallbackError)
      return []
    }
  }
}

export async function getUserById(id: number): Promise<UserResponse> {
  try {
    const data = await apiCall(`/admin/users/${id}`, { method: 'GET' })
    return data as UserResponse
  } catch (error) {
    // Fallback to employee endpoint
    const data = await apiCall(`/admin/employees/${id}`, { method: 'GET' })
    return {
      id: data.id,
      email: data.email,
      name: data.name,
      roles: data.roles || ['EMPLOYEE'],
      status: data.status || 'ACTIVE',
      createdAt: data.createdAt
    } as UserResponse
  }
}

export async function updateUser(
  id: number,
  payload: { name?: string; email?: string; status?: 'ACTIVE' | 'INACTIVE'; roles?: string[] }
): Promise<UserResponse> {
  const data = await apiCall(`/admin/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return data as UserResponse
}

export async function deleteUser(id: number): Promise<void> {
  await apiCall(`/admin/users/${id}`, { method: 'DELETE' })
}