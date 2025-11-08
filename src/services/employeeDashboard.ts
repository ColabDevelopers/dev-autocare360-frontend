import { apiCall } from '@/lib/api'

// ============================================
// INTERFACES / TYPES
// ============================================

export interface EmployeeDashboardSummary {
  activeJobs: number
  jobsInProgress: number
  todayHours: number
  targetHours: number
  completedThisMonth: number
  efficiencyRate: number
  employeeName: string
  greeting: string
}

export interface AssignedJob {
  id: number
  type: string
  customer: string
  customerId: number
  vehicle: string
  progress: number
  status: string
  estimatedHours: number
  loggedHours: number
  dueDate: string | null
  appointmentDate: string
  appointmentTime: string
  appointmentId: number
  description: string | null
  updatedAt: string
}

export interface TodayAppointment {
  id: number
  service: string
  customer: string
  customerId: number
  time: string
  vehicle: string
  status: string
  specialInstructions: string | null
}

export interface WeeklyWorkload {
  dayName: string
  date: string
  hours: number
  dayOfWeek: number
}

export interface TaskDistribution {
  name: string
  value: number
  color: string
}

export interface UpdateJobStatusRequest {
  status: string
  progress?: number
  notes?: string
}

export interface JobStatusUpdateResponse {
  jobId: number
  status: string
  progress: number
  updatedAt: string
  message: string
}

export interface JobActionResponse {
  jobId: number
  status: string
  message: string
  startedAt: string
}

// ============================================
// EMPLOYEE DASHBOARD ENDPOINTS
// ============================================

/**
 * 1. GET /api/employee/dashboard/summary - Get dashboard statistics
 * Returns overview stats: active jobs, hours, completed jobs, efficiency
 */
export async function getDashboardSummary(): Promise<EmployeeDashboardSummary> {
  console.log('📊 getDashboardSummary called')

  try {
    const data = await apiCall('/api/employee/dashboard/summary', { method: 'GET' })
    console.log('✅ getDashboardSummary response:', data)
    return data as EmployeeDashboardSummary
  } catch (error) {
    console.error('❌ getDashboardSummary failed:', error)
    throw error
  }
}

/**
 * 2. GET /api/employee/dashboard/assigned-jobs - Get assigned jobs
 * @param status Optional status filter (IN_PROGRESS, APPROVED, PENDING, COMPLETED)
 * @param includeCompleted Whether to include completed jobs (default: false)
 */
export async function getAssignedJobs(
  status?: string,
  includeCompleted?: boolean
): Promise<AssignedJob[]> {
  console.log('📋 getAssignedJobs called with:', { status, includeCompleted })

  let url = '/api/employee/dashboard/assigned-jobs'
  const params = new URLSearchParams()

  if (status) {
    params.append('status', status)
  }
  if (includeCompleted !== undefined) {
    params.append('includeCompleted', includeCompleted.toString())
  }

  if (params.toString()) {
    url += `?${params.toString()}`
  }

  console.log('🔗 Calling API endpoint:', url)

  try {
    const data = await apiCall(url, { method: 'GET' })
    console.log('✅ getAssignedJobs response:', data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('❌ getAssignedJobs failed:', error)
    throw error
  }
}

/**
 * 3. GET /api/employee/dashboard/today-appointments - Get today's appointments
 * Returns appointments scheduled for today
 */
export async function getTodayAppointments(): Promise<TodayAppointment[]> {
  console.log('📅 getTodayAppointments called')

  try {
    const data = await apiCall('/api/employee/dashboard/today-appointments', { method: 'GET' })
    console.log('✅ getTodayAppointments response:', data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('❌ getTodayAppointments failed:', error)
    throw error
  }
}

/**
 * 4. GET /api/employee/dashboard/weekly-workload - Get weekly hours chart data
 * @param weekOffset Week offset (0 = current week, -1 = last week, 1 = next week)
 */
export async function getWeeklyWorkload(weekOffset?: number): Promise<WeeklyWorkload[]> {
  console.log('📈 getWeeklyWorkload called with:', { weekOffset })

  let url = '/api/employee/dashboard/weekly-workload'

  if (weekOffset !== undefined) {
    url += `?weekOffset=${weekOffset}`
  }

  console.log('🔗 Calling API endpoint:', url)

  try {
    const data = await apiCall(url, { method: 'GET' })
    console.log('✅ getWeeklyWorkload response:', data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('❌ getWeeklyWorkload failed:', error)
    throw error
  }
}

/**
 * 5. GET /api/employee/dashboard/task-distribution - Get task distribution data
 * @param period Time period (week, month, year) - default: month
 */
export async function getTaskDistribution(
  period?: 'week' | 'month' | 'year'
): Promise<TaskDistribution[]> {
  console.log('🥧 getTaskDistribution called with:', { period })

  let url = '/api/employee/dashboard/task-distribution'

  if (period) {
    url += `?period=${period}`
  }

  console.log('🔗 Calling API endpoint:', url)

  try {
    const data = await apiCall(url, { method: 'GET' })
    console.log('✅ getTaskDistribution response:', data)
    return Array.isArray(data) ? data : []
  } catch (error) {
    console.error('❌ getTaskDistribution failed:', error)
    throw error
  }
}

/**
 * 6. PUT /api/employee/dashboard/jobs/{jobId}/status - Update job status
 * Updates the status and/or progress of a job
 */
export async function updateJobStatus(
  jobId: number,
  payload: UpdateJobStatusRequest
): Promise<JobStatusUpdateResponse> {
  console.log('🔄 updateJobStatus called with:', { jobId, payload })

  try {
    const data = await apiCall(`/api/employee/dashboard/jobs/${jobId}/status`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    console.log('✅ updateJobStatus response:', data)
    return data as JobStatusUpdateResponse
  } catch (error) {
    console.error('❌ updateJobStatus failed:', error)
    throw error
  }
}

/**
 * 7. POST /api/employee/dashboard/jobs/{jobId}/start - Start a job
 * Changes job status to IN_PROGRESS
 */
export async function startJob(jobId: number): Promise<JobActionResponse> {
  console.log('▶️ startJob called with:', { jobId })

  try {
    const data = await apiCall(`/api/employee/dashboard/jobs/${jobId}/start`, {
      method: 'POST',
    })
    console.log('✅ startJob response:', data)
    return data as JobActionResponse
  } catch (error) {
    console.error('❌ startJob failed:', error)
    throw error
  }
}
