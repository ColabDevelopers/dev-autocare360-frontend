import { apiCall } from '@/lib/api'

// ============================================
// INTERFACES / TYPES
// ============================================

export interface TimeLogResponse {
  id: number
  date: string
  appointmentId: number
  project: string
  customerId: number
  customer: string
  hours: number
  description: string
  status: string
  employeeId: number
  employeeName: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedTimeLogResponse {
  content: TimeLogResponse[]
  currentPage: number
  totalItems: number
  totalPages: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}

export interface CreateTimeLogRequest {
  appointmentId: number
  hours: number
  description: string
  date: string // Format: "YYYY-MM-DD"
  status?: string // Optional, defaults to "COMPLETED"
}

export interface UpdateTimeLogRequest {
  appointmentId?: number
  hours?: number
  description?: string
  date?: string // Format: "YYYY-MM-DD"
  status?: string
}


export interface TimeLogSummary {
  totalHoursToday: number
  totalHoursWeek: number
  totalEntries: number
  efficiencyRate: number
}

export interface ActiveProject {
  id: number
  name: string
  customerId: number
  customerName: string
}

export interface TimerResponse {
  timerId: number | null
  appointmentId: number | null
  projectName: string | null
  startTime: string | null
  elapsedSeconds: number | null
  elapsedHours: number | null
  isActive: boolean
}

export interface StartTimerRequest {
  appointmentId: number
}

export interface StopTimerRequest {
  timerId: number
  description: string
}

// ============================================
// TIME LOG ENDPOINTS
// ============================================

/**
 * 1. GET /api/time-logs - Get all time logs for the logged-in employee (with pagination)
 * @param startDate Optional start date filter (YYYY-MM-DD)
 * @param endDate Optional end date filter (YYYY-MM-DD)
 * @param page Page number (0-indexed, default: 0)
 * @param size Number of items per page (default: 10)
 */
export async function getTimeLogs(
  startDate?: string,
  endDate?: string,
  page: number = 0,
  size: number = 10
): Promise<PaginatedTimeLogResponse> {
  console.log('🕐 getTimeLogs called with:', { startDate, endDate, page, size })
  
  let url = `/api/time-logs?page=${page}&size=${size}`
  
  if (startDate && endDate) {
    url += `&startDate=${startDate}&endDate=${endDate}`
  }
  
  console.log('🔗 Calling API endpoint:', url)
  
  try {
    const data = await apiCall(url, { method: 'GET' })
    console.log('✅ getTimeLogs response:', data)
    return data as PaginatedTimeLogResponse
  } catch (error) {
    console.error('❌ getTimeLogs failed:', error)
    throw error
  }
}

/**
 * 2. POST /api/time-logs - Create a new time log entry
 */
export async function createTimeLog(
  payload: CreateTimeLogRequest
): Promise<TimeLogResponse> {
  const data = await apiCall('/api/time-logs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data as TimeLogResponse
}

/**
 * 3. PUT /api/time-logs/{id} - Update an existing time log
 */
export async function updateTimeLog(
  id: number,
  payload: UpdateTimeLogRequest
): Promise<TimeLogResponse> {
  const data = await apiCall(`/api/time-logs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
  return data as TimeLogResponse
}

/**
 * 4. DELETE /api/time-logs/{id} - Delete a time log
 */
export async function deleteTimeLog(id: number): Promise<void> {
  await apiCall(`/api/time-logs/${id}`, { method: 'DELETE' })
}

/**
 * 5. GET /api/time-logs/summary - Get time log statistics
 * Returns total hours today, this week, total entries, and efficiency rate
 */
export async function getTimeLogSummary(): Promise<TimeLogSummary> {
  const data = await apiCall('/api/time-logs/summary', { method: 'GET' })
  return data as TimeLogSummary
}

/**
 * 6. GET /api/time-logs/active-projects - Get active appointments
 * Returns appointments with status "IN_PROGRESS" or "APPROVED"
 */
export async function getActiveProjects(): Promise<ActiveProject[]> {
  const data = await apiCall('/api/time-logs/active-projects', { method: 'GET' })
  return Array.isArray(data) ? data : []
}

// ============================================
// TIMER ENDPOINTS
// ============================================

/**
 * 7. POST /api/time-logs/timer/start - Start a timer for an appointment
 */
export async function startTimer(
  payload: StartTimerRequest
): Promise<TimerResponse> {
  const data = await apiCall('/api/time-logs/timer/start', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data as TimerResponse
}

/**
 * 8. POST /api/time-logs/timer/stop - Stop a running timer
 * Automatically creates a time log entry from the timer duration
 */
export async function stopTimer(
  payload: StopTimerRequest
): Promise<TimeLogResponse> {
  const data = await apiCall('/api/time-logs/timer/stop', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return data as TimeLogResponse
}

/**
 * 9. GET /api/time-logs/timer/active - Get the currently active timer
 * Returns timer details with real-time elapsed time, or isActive: false if no timer is running
 */
export async function getActiveTimer(): Promise<TimerResponse> {
  const data = await apiCall('/api/time-logs/timer/active', { method: 'GET' })
  return data as TimerResponse
}
