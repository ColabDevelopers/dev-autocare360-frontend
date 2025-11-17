import { apiCall } from '@/lib/api'

export interface CustomerResponse {
  id: number | string
  email: string
  name: string
  status?: string
  joinDate?: string
  vehicles?: number
}

export async function listCustomers(): Promise<CustomerResponse[]> {
  const data = await apiCall('/admin/customers', { method: 'GET' })
  return Array.isArray(data) ? data : []
}

export async function getCustomer(id: number | string): Promise<CustomerResponse> {
  const data = await apiCall(`/admin/customers/${id}`, { method: 'GET' })
  return data as CustomerResponse
}

export async function updateCustomer(
  id: number | string,
  payload: { name?: string; phone?: string; status?: string }
): Promise<CustomerResponse> {
  const data = await apiCall(`/admin/customers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return data as CustomerResponse
}

export async function deleteCustomer(id: number | string): Promise<void> {
  await apiCall(`/admin/customers/${id}`, { method: 'DELETE' })
}
