'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, Plus, Play, Pause, Edit, Trash2, Calendar, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  getTimeLogs,
  createTimeLog,
  updateTimeLog,
  deleteTimeLog,
  getTimeLogSummary,
  getActiveProjects,
  startTimer,
  stopTimer,
  getActiveTimer,
  type TimeLogResponse,
  type ActiveProject,
  type TimerResponse,
  type TimeLogSummary,
} from '@/services/timelogs'

export default function TimeLogsPage() {
  const { toast } = useToast()
  const [timeLogs, setTimeLogs] = useState<TimeLogResponse[]>([])
  const [activeProjects, setActiveProjects] = useState<ActiveProject[]>([])
  const [summary, setSummary] = useState<TimeLogSummary | null>(null)
  const [activeTimerData, setActiveTimerData] = useState<TimerResponse | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingLog, setEditingLog] = useState<TimeLogResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const [newTimeLog, setNewTimeLog] = useState({
    appointmentId: '',
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    status: 'COMPLETED',
  })

  const [editTimeLogData, setEditTimeLogData] = useState({
    appointmentId: '',
    hours: '',
    description: '',
    date: '',
    status: '',
  })

  const [stopTimerDescription, setStopTimerDescription] = useState('')
  const [stopTimerDialogOpen, setStopTimerDialogOpen] = useState(false)

  // Load initial data
  useEffect(() => {
    // Debug: Check authentication state
    console.log('🔍 Time Logs Page - Checking Auth State')
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      console.log('Token present:', !!token)
      if (token) {
        console.log('Token preview:', token.substring(0, 30) + '...')
      }
    }

    loadAllData()
  }, [])

  // Setup timer interval to check active timer status
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      if (activeTimerData?.isActive) {
        fetchActiveTimer()
      }
    }, 5000) // Check every 5 seconds

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [activeTimerData?.isActive])

  const loadAllData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([
        fetchTimeLogs(),
        fetchActiveProjects(),
        fetchSummary(),
        fetchActiveTimer(),
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast({
        title: 'Error',
        description: 'Failed to load time log data',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTimeLogs = async () => {
    try {
      const logs = await getTimeLogs()
      console.log('📋 Fetched Time Logs:', logs)
      setTimeLogs(logs)
    } catch (error) {
      console.error('Error fetching time logs:', error)
    }
  }

  const fetchActiveProjects = async () => {
    try {
      const projects = await getActiveProjects()
      console.log('🎯 Fetched Active Projects:', projects)
      setActiveProjects(projects)
    } catch (error) {
      console.error('Error fetching active projects:', error)
    }
  }

  const fetchSummary = async () => {
    try {
      const summaryData = await getTimeLogSummary()
      console.log('📊 Fetched Summary:', summaryData)
      setSummary(summaryData)
    } catch (error) {
      console.error('Error fetching summary:', error)
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

  const handleAddTimeLog = async () => {
    if (!newTimeLog.appointmentId || !newTimeLog.hours || !newTimeLog.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createTimeLog({
        appointmentId: Number(newTimeLog.appointmentId),
        hours: Number(newTimeLog.hours),
        description: newTimeLog.description,
        date: newTimeLog.date,
        status: newTimeLog.status,
      })

      toast({
        title: 'Success',
        description: 'Time log created successfully',
      })

      setNewTimeLog({
        appointmentId: '',
        hours: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
      })
      setIsAddDialogOpen(false)

      // Reload data
      await fetchTimeLogs()
      await fetchSummary()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create time log',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditTimeLog = async () => {
    if (!editingLog) return

    setIsSubmitting(true)
    try {
      const updateData: any = {}
      if (editTimeLogData.appointmentId)
        updateData.appointmentId = Number(editTimeLogData.appointmentId)
      if (editTimeLogData.hours) updateData.hours = Number(editTimeLogData.hours)
      if (editTimeLogData.description) updateData.description = editTimeLogData.description
      if (editTimeLogData.date) updateData.date = editTimeLogData.date
      if (editTimeLogData.status) updateData.status = editTimeLogData.status

      await updateTimeLog(editingLog.id, updateData)

      toast({
        title: 'Success',
        description: 'Time log updated successfully',
      })

      setIsEditDialogOpen(false)
      setEditingLog(null)

      // Reload data
      await fetchTimeLogs()
      await fetchSummary()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update time log',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTimeLog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this time log?')) return

    try {
      await deleteTimeLog(id)
      toast({
        title: 'Success',
        description: 'Time log deleted successfully',
      })

      // Reload data
      await fetchTimeLogs()
      await fetchSummary()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete time log',
        variant: 'destructive',
      })
    }
  }

  const openEditDialog = (log: TimeLogResponse) => {
    setEditingLog(log)
    setEditTimeLogData({
      appointmentId: log.appointmentId.toString(),
      hours: log.hours.toString(),
      description: log.description,
      date: log.date,
      status: log.status,
    })
    setIsEditDialogOpen(true)
  }

  const handleStartTimer = async (appointmentId: number) => {
    setIsSubmitting(true)
    try {
      await startTimer({ appointmentId })
      toast({
        title: 'Success',
        description: 'Timer started successfully',
      })

      // Fetch updated active timer
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
        description: 'Timer stopped and time log created',
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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Time Logs</h1>
          <p className="text-muted-foreground text-balance">
            Track and manage your work hours across projects.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Log Time
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Log Work Time</DialogTitle>
              <DialogDescription>Record time spent on a project or service.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project/Service *</Label>
                <Select
                  value={newTimeLog.appointmentId}
                  onValueChange={value => setNewTimeLog({ ...newTimeLog, appointmentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeProjects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name} - {project.customerName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours *</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="24"
                    placeholder="e.g., 2.5"
                    value={newTimeLog.hours}
                    onChange={e => setNewTimeLog({ ...newTimeLog, hours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={newTimeLog.date}
                    onChange={e => setNewTimeLog({ ...newTimeLog, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Work Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the work performed..."
                  value={newTimeLog.description}
                  onChange={e => setNewTimeLog({ ...newTimeLog, description: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddTimeLog}
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Log Time
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalHoursToday.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-muted-foreground">Target: 8.0 hours</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalHoursWeek.toFixed(1) || '0.0'}</div>
            <p className="text-xs text-muted-foreground">Target: 40.0 hours</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Timer</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {activeTimerData?.isActive && activeTimerData.elapsedSeconds
                ? formatTime(activeTimerData.elapsedSeconds)
                : '00:00:00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeTimerData?.isActive ? 'Running' : 'No active timer'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.efficiencyRate.toFixed(0) || '0'}%</div>
            <p className="text-xs text-muted-foreground">
              {(summary?.efficiencyRate || 0) >= 100 ? 'Excellent!' : 'Keep going!'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="timer" className="space-y-6">
        <TabsList>
          <TabsTrigger value="timer">Active Timer</TabsTrigger>
          <TabsTrigger value="logs">Time Logs</TabsTrigger>
          <TabsTrigger value="summary">Weekly Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Project Timer</CardTitle>
              <CardDescription>
                Start a timer to automatically track time spent on projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {activeTimerData?.isActive && (
                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-medium mb-2">{activeTimerData.projectName}</h3>
                  <div className="text-4xl font-mono font-bold text-primary mb-4">
                    {formatTime(activeTimerData.elapsedSeconds || 0)}
                  </div>
                  <Dialog open={stopTimerDialogOpen} onOpenChange={setStopTimerDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Pause className="mr-2 h-4 w-4" />
                        Stop Timer
                      </Button>
                    </DialogTrigger>
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
                        <div className="text-sm text-muted-foreground">
                          Elapsed Time: {formatTime(activeTimerData.elapsedSeconds || 0)}(
                          {activeTimerData.elapsedHours?.toFixed(2) || '0.00'} hours)
                        </div>
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
              )}

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Available Projects</h4>
                {activeProjects.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active projects available</p>
                ) : (
                  <div className="grid gap-4">
                    {activeProjects.map(project => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium">{project.name}</h4>
                          <p className="text-sm text-muted-foreground">{project.customerName}</p>
                        </div>
                        <Button
                          onClick={() => handleStartTimer(project.id)}
                          disabled={activeTimerData?.isActive || isSubmitting}
                          variant={
                            activeTimerData?.appointmentId === project.id ? 'secondary' : 'outline'
                          }
                        >
                          {isSubmitting ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Play className="mr-2 h-4 w-4" />
                          )}
                          {activeTimerData?.appointmentId === project.id ? 'Active' : 'Start Timer'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Time Log History</CardTitle>
              <CardDescription>View and manage your recorded work hours</CardDescription>
            </CardHeader>
            <CardContent>
              {timeLogs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No time logs recorded yet</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>{log.date}</TableCell>
                        <TableCell className="font-medium">{log.project}</TableCell>
                        <TableCell>{log.customer}</TableCell>
                        <TableCell>{log.hours}h</TableCell>
                        <TableCell className="max-w-xs truncate">{log.description}</TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              log.status === 'COMPLETED'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-blue-500/10 text-blue-500'
                            }
                          >
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(log)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteTimeLog(log.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary">
          <div className="grid gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Weekly Summary</CardTitle>
                <CardDescription>Overview of your work hours and productivity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">
                      {summary?.totalHoursWeek.toFixed(1) || '0.0'}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {summary?.totalEntries || 0}
                    </div>
                    <p className="text-sm text-muted-foreground">Time Entries</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {summary?.efficiencyRate.toFixed(0) || '0'}%
                    </div>
                    <p className="text-sm text-muted-foreground">Efficiency Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Time Log</DialogTitle>
            <DialogDescription>Update the time log details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-project">Project/Service</Label>
              <Select
                value={editTimeLogData.appointmentId}
                onValueChange={value =>
                  setEditTimeLogData({ ...editTimeLogData, appointmentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {activeProjects.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name} - {project.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-hours">Hours</Label>
                <Input
                  id="edit-hours"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="24"
                  placeholder="e.g., 2.5"
                  value={editTimeLogData.hours}
                  onChange={e => setEditTimeLogData({ ...editTimeLogData, hours: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date</Label>
                <Input
                  id="edit-date"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={editTimeLogData.date}
                  onChange={e => setEditTimeLogData({ ...editTimeLogData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Work Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe the work performed..."
                value={editTimeLogData.description}
                onChange={e =>
                  setEditTimeLogData({ ...editTimeLogData, description: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleEditTimeLog}
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
