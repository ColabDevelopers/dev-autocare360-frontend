'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  CalendarIcon,
  Clock,
  Wrench,
  CheckCircle,
  AlertCircle,
  MessageCircle,
  Play,
  Pause,
  BarChart3,
  Loader2,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { useToast } from '@/hooks/use-toast'
import {
  getDashboardSummary,
  getAssignedJobs,
  getTodayAppointments,
  getWeeklyWorkload,
  getTaskDistribution,
  updateJobStatus,
  startJob,
  type EmployeeDashboardSummary,
  type AssignedJob,
  type TodayAppointment,
  type WeeklyWorkload,
  type TaskDistribution,
} from '@/services/employeeDashboard'
import { startTimer, stopTimer, getActiveTimer, type TimerResponse } from '@/services/timelogs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

// Keep mock data as backup (will be replaced with real data)
const mockAssignedJobs = [
  {
    id: 1,
    type: 'Oil Change',
    customer: 'John Smith',
    vehicle: 'Toyota Camry 2020',
    progress: 75,
    status: 'In Progress',
    estimatedHours: 0.5,
    loggedHours: 0.4,
    dueDate: '2024-01-15',
  },
  {
    id: 2,
    type: 'Custom Exhaust System',
    customer: 'Sarah Johnson',
    vehicle: 'Toyota Camry 2020',
    progress: 45,
    status: 'In Progress',
    estimatedHours: 8,
    loggedHours: 3.6,
    dueDate: '2024-01-20',
  },
  {
    id: 3,
    type: 'Brake Inspection',
    customer: 'Mike Wilson',
    vehicle: 'Honda Civic 2019',
    progress: 100,
    status: 'Completed',
    estimatedHours: 2,
    loggedHours: 1.8,
    dueDate: '2024-01-10',
  },
]

const mockUpcomingAppointments = [
  {
    id: 1,
    service: 'Tire Rotation',
    customer: 'Alice Brown',
    time: '10:00 AM',
    vehicle: 'Ford F-150 2021',
  },
  {
    id: 2,
    service: 'AC Service',
    customer: 'Bob Davis',
    time: '2:00 PM',
    vehicle: 'BMW X5 2020',
  },
]

const workloadData = [
  { name: 'Mon', hours: 8 },
  { name: 'Tue', hours: 7.5 },
  { name: 'Wed', hours: 8 },
  { name: 'Thu', hours: 6 },
  { name: 'Fri', hours: 8 },
  { name: 'Sat', hours: 4 },
  { name: 'Sun', hours: 0 },
]

const taskDistribution = [
  { name: 'Oil Changes', value: 35, color: '#3b82f6' },
  { name: 'Brake Services', value: 25, color: '#10b981' },
  { name: 'Custom Projects', value: 20, color: '#f59e0b' },
  { name: 'Inspections', value: 20, color: '#ef4444' },
]

export default function EmployeeDashboard() {
  const { toast } = useToast()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // State for API data
  const [summary, setSummary] = useState<EmployeeDashboardSummary | null>(null)
  const [assignedJobs, setAssignedJobs] = useState<AssignedJob[]>([])
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([])
  const [weeklyWorkload, setWeeklyWorkload] = useState<WeeklyWorkload[]>([])
  const [taskDistribution, setTaskDistribution] = useState<TaskDistribution[]>([])
  const [activeTimerData, setActiveTimerData] = useState<TimerResponse | null>(null)

  // Dialog states
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false)
  const [stopTimerDialogOpen, setStopTimerDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<AssignedJob | null>(null)
  const [statusUpdate, setStatusUpdate] = useState({ status: '', progress: 0 })
  const [stopTimerDescription, setStopTimerDescription] = useState('')

  // Load all dashboard data
  useEffect(() => {
    loadAllData()
  }, [])

  // Timer functionality - poll every 5 seconds if timer is active
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimerData?.isActive) {
      interval = setInterval(() => {
        fetchActiveTimer()
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [activeTimerData?.isActive])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchDashboardSummary(),
        fetchAssignedJobs(),
        fetchTodayAppointments(),
        fetchWeeklyWorkload(),
        fetchTaskDistribution(),
        fetchActiveTimer(),
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchDashboardSummary = async () => {
    try {
      const data = await getDashboardSummary()
      console.log('📊 Dashboard Summary:', data)
      setSummary(data)
    } catch (error) {
      console.error('Error fetching dashboard summary:', error)
    }
  }

  const fetchAssignedJobs = async () => {
    try {
      const data = await getAssignedJobs()
      console.log('📋 Assigned Jobs:', data)
      setAssignedJobs(data)
    } catch (error) {
      console.error('Error fetching assigned jobs:', error)
    }
  }

  const fetchTodayAppointments = async () => {
    try {
      const data = await getTodayAppointments()
      console.log('📅 Today Appointments:', data)
      setTodayAppointments(data)
    } catch (error) {
      console.error('Error fetching today appointments:', error)
    }
  }

  const fetchWeeklyWorkload = async () => {
    try {
      const data = await getWeeklyWorkload()
      console.log('📈 Weekly Workload:', data)
      setWeeklyWorkload(data)
    } catch (error) {
      console.error('Error fetching weekly workload:', error)
    }
  }

  const fetchTaskDistribution = async () => {
    try {
      const data = await getTaskDistribution()
      console.log('🥧 Task Distribution:', data)
      setTaskDistribution(data)
    } catch (error) {
      console.error('Error fetching task distribution:', error)
    }
  }

  const fetchActiveTimer = async () => {
    try {
      const timer = await getActiveTimer()
      setActiveTimerData(timer)
    } catch (error) {
      console.error('Error fetching active timer:', error)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStartJob = async (appointmentId: number) => {
    setIsSubmitting(true)
    try {
      await startJob(appointmentId)
      toast({
        title: 'Success',
        description: 'Job started successfully',
      })

      // Refresh data
      await Promise.all([fetchAssignedJobs(), fetchDashboardSummary()])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start job',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartTimer = async (appointmentId: number) => {
    setIsSubmitting(true)
    try {
      await startTimer({ appointmentId })
      toast({
        title: 'Success',
        description: 'Timer started successfully',
      })

      // Refresh timer data
      await fetchActiveTimer()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to start timer',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStopTimer = async () => {
    if (!activeTimerData?.timerId || !stopTimerDescription.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a description for the work completed',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await stopTimer({
        timerId: activeTimerData.timerId,
        description: stopTimerDescription,
      })

      toast({
        title: 'Success',
        description: 'Timer stopped and time logged',
      })

      setStopTimerDialogOpen(false)
      setStopTimerDescription('')

      // Reload all data
      await loadAllData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to stop timer',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const openUpdateStatusDialog = (job: AssignedJob) => {
    setSelectedJob(job)
    setStatusUpdate({
      status: job.status,
      progress: job.progress,
    })
    setUpdateStatusDialogOpen(true)
  }

  const handleUpdateJobStatus = async () => {
    if (!selectedJob) return

    setIsSubmitting(true)
    try {
      await updateJobStatus(selectedJob.id, {
        status: statusUpdate.status,
        progress: statusUpdate.progress,
      })

      toast({
        title: 'Success',
        description: 'Job status updated successfully',
      })

      setUpdateStatusDialogOpen(false)
      setSelectedJob(null)

      // Reload jobs and summary
      await Promise.all([fetchAssignedJobs(), fetchDashboardSummary()])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update job status',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-500'
      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return 'bg-blue-500'
      case 'PENDING':
      case 'SCHEDULED':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'IN_PROGRESS':
      case 'IN PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'PENDING':
      case 'SCHEDULED':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusDisplayName = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">
            Good morning, Technician!
          </h1>
          <p className="text-muted-foreground text-balance">
            You have {summary?.activeJobs || 0} active jobs and {todayAppointments.length}{' '}
            appointments today.
          </p>
        </div>
        <div className="flex space-x-2">
          {/* Clock In button - no API implemented yet */}
          <Button variant="outline" disabled>
            <Clock className="mr-2 h-4 w-4" />
            Clock In
          </Button>
          {/* Messages button - no API implemented yet */}
          <Button className="bg-primary hover:bg-primary/90" disabled>
            <MessageCircle className="mr-2 h-4 w-4" />
            Messages
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.activeJobs || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.jobsInProgress || 0} in progress
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.todayHours.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-muted-foreground">Target: 8 hours</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.completedThisMonth || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.efficiencyRate.toFixed(0) || '0'}%</div>
            <p className="text-xs text-muted-foreground">
              {(summary?.efficiencyRate || 0) >= 100 ? 'Above average' : 'Keep going!'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Jobs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Assigned Jobs</span>
              </CardTitle>
              <CardDescription>Track progress and log time for your assigned work</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {assignedJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No assigned jobs</p>
              ) : (
                assignedJobs.map(job => (
                  <div key={job.id} className="space-y-3 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h4 className="font-medium">{job.type}</h4>
                          <p className="text-sm text-muted-foreground">
                            {job.customer} • {job.vehicle}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(job.status)} text-white`}
                      >
                        {getStatusDisplayName(job.status)}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{job.progress}%</span>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        Time: {job.loggedHours}h / {job.estimatedHours}h
                      </span>
                      <span>Due: {job.dueDate || 'Not set'}</span>
                    </div>

                    {/* Timer Section */}
                    {activeTimerData?.isActive &&
                      activeTimerData.appointmentId === job.appointmentId && (
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Active Timer</span>
                            <span className="font-mono text-lg">
                              {formatTime(activeTimerData.elapsedSeconds || 0)}
                            </span>
                          </div>
                        </div>
                      )}

                    <div className="flex flex-wrap gap-2">
                      {job.status.toUpperCase() === 'IN_PROGRESS' && (
                        <>
                          {activeTimerData?.isActive &&
                          activeTimerData.appointmentId === job.appointmentId ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setStopTimerDialogOpen(true)}
                              disabled={isSubmitting}
                            >
                              <Pause className="mr-1 h-3 w-3" />
                              Stop Timer
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartTimer(job.appointmentId)}
                              disabled={isSubmitting || activeTimerData?.isActive}
                            >
                              {isSubmitting ? (
                                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                              ) : (
                                <Play className="mr-1 h-3 w-3" />
                              )}
                              Start Timer
                            </Button>
                          )}
                        </>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUpdateStatusDialog(job)}
                        disabled={isSubmitting}
                      >
                        Update Status
                      </Button>
                      {/* Contact Customer - no API implemented yet */}
                      <Button variant="ghost" size="sm" disabled>
                        <MessageCircle className="mr-1 h-3 w-3" />
                        Contact Customer
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Today's Appointments</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {todayAppointments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No appointments today</p>
              ) : (
                <div className="space-y-3">
                  {todayAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{appointment.service}</h4>
                          <p className="text-sm text-muted-foreground">
                            {appointment.customer} • {appointment.vehicle}
                          </p>
                          {appointment.specialInstructions && (
                            <p className="text-xs text-muted-foreground italic mt-1">
                              {appointment.specialInstructions}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{appointment.time}</p>
                        <Badge
                          variant="secondary"
                          className={`${getStatusColor(appointment.status)} text-white text-xs mb-1`}
                        >
                          {getStatusDisplayName(appointment.status)}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1 bg-transparent"
                          onClick={() => handleStartJob(appointment.id)}
                          disabled={
                            isSubmitting || appointment.status.toUpperCase() === 'IN_PROGRESS'
                          }
                        >
                          {isSubmitting ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="mr-1 h-3 w-3" />
                          )}
                          {appointment.status.toUpperCase() === 'IN_PROGRESS'
                            ? 'In Progress'
                            : 'Start Job'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border border-border"
              />
            </CardContent>
          </Card>

          {/* Weekly Workload */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Weekly Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {weeklyWorkload.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No workload data</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={weeklyWorkload}>
                    <XAxis dataKey="dayName" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Task Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              {taskDistribution.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No task data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={taskDistribution as any}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {taskDistribution.map(item => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span>{item.name}</span>
                        </div>
                        <span>{item.value}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Status Dialog */}
      <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Job Status</DialogTitle>
            <DialogDescription>
              Update the status and progress of {selectedJob?.type}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={statusUpdate.status}
                onValueChange={value => setStatusUpdate({ ...statusUpdate, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="progress">Progress: {statusUpdate.progress}%</Label>
              <Input
                id="progress"
                type="range"
                min="0"
                max="100"
                step="5"
                value={statusUpdate.progress}
                onChange={e =>
                  setStatusUpdate({ ...statusUpdate, progress: parseInt(e.target.value) })
                }
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>

            {selectedJob && (
              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  <strong>Customer:</strong> {selectedJob.customer}
                </p>
                <p className="text-muted-foreground">
                  <strong>Vehicle:</strong> {selectedJob.vehicle}
                </p>
                <p className="text-muted-foreground">
                  <strong>Current Status:</strong> {getStatusDisplayName(selectedJob.status)}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateJobStatus}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stop Timer Dialog */}
      <Dialog open={stopTimerDialogOpen} onOpenChange={setStopTimerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stop Timer</DialogTitle>
            <DialogDescription>
              Describe the work you completed during this session
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stop-description">Work Description *</Label>
              <Textarea
                id="stop-description"
                placeholder="Describe what you accomplished..."
                value={stopTimerDescription}
                onChange={e => setStopTimerDescription(e.target.value)}
                rows={4}
              />
            </div>
            {activeTimerData && (
              <div className="text-sm text-muted-foreground">
                Elapsed Time: {formatTime(activeTimerData.elapsedSeconds || 0)} (
                {activeTimerData.elapsedHours?.toFixed(2) || '0.00'} hours)
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setStopTimerDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStopTimer} disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Stop & Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
