// services/workload.ts
// Central API client for Admin → Workload Monitoring
// Uses the same helper as time-log.ts
import { apiCall } from "@/lib/api"

// ==========================
// DTO TYPES (match backend + UI needs)
// ==========================

// Top summary strip (Total employees, Avg capacity, Active items)
export interface WorkloadSummaryDto {
  totalEmployees: number
  averageCapacity: number
  activeWorkItems: number
}

// Bar chart + team overview cards (per employee)
export interface CapacityDistributionDto {
  // What the chart / UI expects
  name: string          // label for x-axis (employee name)
  value: number         // numeric value for bar (capacity %)

  // Extra details for richer UI
  employeeId?: number
  capacityUtilization: number
  activeTasks: number
  status: string
}

// Single task summary (used in workload overview)
export interface TaskSummaryDto {
  taskId: number
  taskType: string
  taskName: string
  status: string
  scheduledDate: string | null // ISO
  dueDate: string | null       // ISO
  priority: string
  progress: number
  vehicleInfo: string
}

// Team status ring (Available / Busy / Overloaded)
export interface TeamStatusDto {
  total: number
  available: number
  busy: number
  overloaded: number
  utilizationRate: number
  activeItems: number

  // Aliases for the existing chart code
  availableCount?: number
  busyCount?: number
  overloadedCount?: number
}

// Left schedule list
export interface EmployeeListDto {
  id: number
  name: string
  email: string
  department: string
  status: string
  activeTaskCount: number
  capacityUtilization: number
}

// Per-day breakdown of schedule
export interface ScheduledTaskDto {
  taskId: number
  taskName: string
  startTime: string
  endTime: string
  duration: string
  status: string
  priority: string
  customerName: string
  vehicleInfo: string
}

export interface DailyScheduleDto {
  date: string
  dayOfWeek: string
  tasks: ScheduledTaskDto[]
  totalHours: number
}

// Right-side selected employee schedule card
export interface EmployeeScheduleDto {
  employeeId: number
  name: string
  email: string
  department: string
  status: string
  upcomingSchedule: DailyScheduleDto[]
}

// Task assignment panel
export interface TaskAssignmentRequest {
  taskId: number
  employeeId: number
}

export interface UnassignedTaskDto {
  id: number
  title: string
  customerName: string
  priority: string
  type: string
  dueDate: string
  estimatedHours: number
  vehicleInfo: string
  description: string | null
}

// Used by workload overview cards (one card per employee)
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
  workloadStatus: string // "AVAILABLE" | "BUSY" | "OVERLOADED" | etc.
  upcomingTasks: TaskSummaryDto[]
  activeTasks: TaskSummaryDto[]
}

// ==========================
// "New" core API functions
// ==========================

// 1. Summary cards at top
export async function getWorkloadSummary(): Promise<WorkloadSummaryDto> {
  const data = await apiCall("/api/admin/workload/summary", { method: "GET" })
  return data as WorkloadSummaryDto
}

// 2. All employee workloads (for overview cards)
export async function getEmployeeWorkloads(): Promise<WorkloadResponse[]> {
  const data = await apiCall("/api/admin/workload/team", { method: "GET" })
  return Array.isArray(data) ? (data as WorkloadResponse[]) : []
}

// 3. Capacity distribution chart
export async function getCapacityDistribution(): Promise<CapacityDistributionDto[]> {
  const raw = await apiCall("/api/admin/workload/capacity", { method: "GET" })

  const list = Array.isArray(raw) ? raw : []

  // Map backend fields → UI-friendly shape
  return list.map((item: any) => {
    const name: string = item.employeeName ?? item.name ?? "Unknown"
    const capacity: number =
      typeof item.capacityUtilization === "number"
        ? item.capacityUtilization
        : typeof item.value === "number"
        ? item.value
        : 0

    return {
      name,
      value: capacity,
      employeeId: item.employeeId ?? item.id ?? undefined,
      capacityUtilization: capacity,
      activeTasks: item.activeTasks ?? item.activeTaskCount ?? 0,
      status: item.status ?? "AVAILABLE",
    } satisfies CapacityDistributionDto
  })
}

// 4. Team status overview (Available / Busy / Overloaded)
export async function getTeamStatusOverview(): Promise<TeamStatusDto> {
  const raw = await apiCall("/api/admin/workload/team-status", {
    method: "GET",
  })

  const dto: TeamStatusDto = {
    total: raw.total ?? 0,
    available: raw.available ?? raw.availableCount ?? 0,
    busy: raw.busy ?? raw.busyCount ?? 0,
    overloaded: raw.overloaded ?? raw.overloadedCount ?? 0,
    utilizationRate: raw.utilizationRate ?? raw.utilization ?? 0,
    activeItems: raw.activeItems ?? raw.activeWorkItems ?? 0,
    availableCount: raw.available ?? raw.availableCount ?? 0,
    busyCount: raw.busy ?? raw.busyCount ?? 0,
    overloadedCount: raw.overloaded ?? raw.overloadedCount ?? 0,
  }

  return dto
}

// 5. Unassigned tasks (Task Management section)
export async function getUnassignedTasks(): Promise<UnassignedTaskDto[]> {
  const data = await apiCall("/api/admin/workload/unassigned-tasks", {
    method: "GET",
  })
  return Array.isArray(data) ? (data as UnassignedTaskDto[]) : []
}

// 6. Assign a task to an employee
export async function assignTask(
  payload: TaskAssignmentRequest
): Promise<void> {
  await apiCall("/api/admin/workload/assign", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

// 7. Employees list for schedule (left column)
export async function getEmployeesWithSchedule(): Promise<EmployeeListDto[]> {
  const data = await apiCall("/api/admin/workload/schedule/employees", {
    method: "GET",
  })
  return Array.isArray(data) ? (data as EmployeeListDto[]) : []
}

// 8. Detailed schedule for a specific employee (right column)
export async function getEmployeeSchedule(
  employeeId: number,
  days: number = 7
): Promise<EmployeeScheduleDto> {
  const data = await apiCall(
    `/api/admin/workload/schedule/${employeeId}?days=${days}`,
    { method: "GET" }
  )
  return data as EmployeeScheduleDto
}

// ==========================
// Backwards-compatible exports
// (what page.tsx & components currently import)
// ==========================

// page.tsx imports: fetchWorkloadSummary, fetchCapacityDistribution,
// fetchEmployeeSchedule, fetchEmployeeWorkloads, fetchScheduleEmployees,
// fetchTeamStatus, fetchUnassignedTasks, WorkloadResponse

export const fetchWorkloadSummary = getWorkloadSummary
export const fetchCapacityDistribution = getCapacityDistribution
export const fetchEmployeeSchedule = getEmployeeSchedule
export const fetchEmployeeWorkloads = getEmployeeWorkloads
export const fetchScheduleEmployees = getEmployeesWithSchedule
export const fetchTeamStatus = getTeamStatusOverview
export const fetchUnassignedTasks = getUnassignedTasks
