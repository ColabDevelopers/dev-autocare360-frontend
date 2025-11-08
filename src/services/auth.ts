import { apiCall } from '@/lib/api'
import { saveToken } from '@/lib/auth'

export interface LoginResponse {
  accessToken: string
  user: {
    id: number | string
    email: string
    name: string
    roles: string[]
    status?: 'Active' | 'Inactive'
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const data = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  if (data?.accessToken) saveToken(data.accessToken)
  return data
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  phone: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
}

export async function register(payload: RegisterPayload) {
  return await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function me() {
  return await apiCall('/users/me', { method: 'GET' })
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiCall('/users/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function updateMe(partial: Record<string, unknown>) {
  return await apiCall('/users/me', {
    method: 'PATCH',
    body: JSON.stringify(partial),
  })
}
