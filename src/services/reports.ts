import { apiCall } from '@/lib/api'

export async function getSummary() {
  return apiCall('/api/reports/summary', { method: 'GET' })
}

export async function getRevenueTrend() {
  return apiCall('/api/reports/revenue-trend', { method: 'GET' })
}

export async function getServiceTypes() {
  return apiCall('/api/reports/service-type-distribution', { method: 'GET' })
}

export async function getPerformanceMetrics() {
  return apiCall('/api/reports/performance', { method: 'GET' })
}
