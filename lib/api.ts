// lib/api.ts
export const API_CONFIG = {
  BASE_URL: (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE) || 'http://localhost:8080',
  ENDPOINTS: {
    USERS: '/api/users',
    APPOINTMENTS: '/api/appointments',
    AVAILABILITY: '/api/availability',
    VEHICLES: '/api/vehicles',
    SERVICES: '/api/services',
  },
}

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  const token = localStorage.getItem('accessToken')
  
  // Debug: Check if token exists
  console.log('Token exists:', !!token)
  
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// API Helper function
export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE || ''
  const url = `${baseUrl}${endpoint}`

  const token = localStorage.getItem('accessToken')

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(url, { ...options, headers })

  if (!res.ok) {
    const errorText = await res.text()
    console.error(`API error (${res.status}):`, errorText)
    throw new Error(`API request failed: ${res.status}`)
  }

  // Only parse JSON if response has content
  const text = await res.text()
  return text ? JSON.parse(text) : null
}
