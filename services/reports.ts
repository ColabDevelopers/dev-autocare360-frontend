import { apiCall } from '@/lib/api'

export interface RevenueData {
  month: string
  revenue: number
  services: number
}

export interface ProductivityData {
  employeeId: number
  name: string
  hoursLogged: number
  tasksCompleted: number
  averageTaskTime: number
  efficiency: number
}

export interface CompletionRateData {
  period: string
  completed: number
  total: number
  rate: number
}

export interface CustomerSatisfactionData {
  period: string
  rating: number
  reviews: number
}

export interface ReportFilters {
  startDate?: string
  endDate?: string
  employeeId?: number
  serviceType?: string
}

// Get revenue report
export async function getRevenueReport(filters?: ReportFilters): Promise<RevenueData[]> {
  try {
    const queryParams = new URLSearchParams()
    if (filters?.startDate) queryParams.append('start', filters.startDate)
    if (filters?.endDate) queryParams.append('end', filters.endDate)
    
    const url = `/admin/reports/revenue${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const data = await apiCall(url, { method: 'GET' })
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch revenue report:', error)
    return []
  }
}

// Get employee productivity report
export async function getEmployeeProductivity(filters?: ReportFilters): Promise<ProductivityData[]> {
  try {
    const queryParams = new URLSearchParams()
    if (filters?.startDate) queryParams.append('start', filters.startDate)
    if (filters?.endDate) queryParams.append('end', filters.endDate)
    
    const url = `/admin/reports/employee-productivity${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const data = await apiCall(url, { method: 'GET' })
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch productivity report:', error)
    return []
  }
}

// Get completion rate
export async function getCompletionRate(filters?: ReportFilters): Promise<CompletionRateData[]> {
  try {
    const queryParams = new URLSearchParams()
    if (filters?.startDate) queryParams.append('start', filters.startDate)
    if (filters?.endDate) queryParams.append('end', filters.endDate)
    
    const url = `/admin/reports/completion-rate${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const data = await apiCall(url, { method: 'GET' })
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch completion rate:', error)
    return []
  }
}

// Get customer satisfaction metrics
export async function getCustomerSatisfaction(filters?: ReportFilters): Promise<CustomerSatisfactionData[]> {
  try {
    const queryParams = new URLSearchParams()
    if (filters?.startDate) queryParams.append('start', filters.startDate)
    if (filters?.endDate) queryParams.append('end', filters.endDate)
    
    const url = `/admin/reports/customer-satisfaction${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const data = await apiCall(url, { method: 'GET' })
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('Failed to fetch satisfaction metrics:', error)
    return []
  }
}

// Export report
export async function exportReport(type: string, format: 'pdf' | 'excel', filters?: ReportFilters): Promise<void> {
  try {
    const queryParams = new URLSearchParams()
    queryParams.append('type', type)
    queryParams.append('format', format)
    if (filters?.startDate) queryParams.append('start', filters.startDate)
    if (filters?.endDate) queryParams.append('end', filters.endDate)
    
    const url = `/admin/reports/export?${queryParams.toString()}`
    
    // This will trigger a download
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters || {}),
    })
    
    if (!response.ok) throw new Error('Export failed')
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = `report-${type}-${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Failed to export report:', error)
    throw error
  }
}

// Get all report metrics summary
export async function getReportSummary(filters?: ReportFilters): Promise<any> {
  try {
    const queryParams = new URLSearchParams()
    if (filters?.startDate) queryParams.append('start', filters.startDate)
    if (filters?.endDate) queryParams.append('end', filters.endDate)
    
    const url = `/admin/reports/summary${queryParams.toString() ? '?' + queryParams.toString() : ''}`
    const data = await apiCall(url, { method: 'GET' })
    return data
  } catch (error) {
    console.error('Failed to fetch report summary:', error)
    return null
  }
}