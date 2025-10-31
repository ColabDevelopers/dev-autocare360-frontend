'use client'

import { useState } from 'react'
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
import { Clock, Plus, Play, Pause, Edit, Trash2, Calendar } from 'lucide-react'

// Mock data
const mockTimeLogs = [
  {
    id: 1,
    date: '2024-01-15',
    project: 'Oil Change - Toyota Camry',
    customer: 'John Smith',
    hours: 0.5,
    description: 'Standard oil change and filter replacement',
    status: 'Completed',
  },
  {
    id: 2,
    date: '2024-01-15',
    project: 'Custom Exhaust - Toyota Camry',
    customer: 'Sarah Johnson',
    hours: 3.5,
    description: 'Fabricated and installed custom exhaust system',
    status: 'In Progress',
  },
  {
    id: 3,
    date: '2024-01-14',
    project: 'Brake Inspection - Honda Civic',
    customer: 'Mike Wilson',
    hours: 1.8,
    description: 'Complete brake system inspection and pad replacement',
    status: 'Completed',
  },
]

const mockActiveProjects = [
  { id: 1, name: 'Oil Change - Toyota Camry', customer: 'John Smith' },
  { id: 2, name: 'Custom Exhaust - Toyota Camry', customer: 'Sarah Johnson' },
  { id: 3, name: 'AC Service - BMW X5', customer: 'Bob Davis' },
]

export default function TimeLogsPage() {
  const [timeLogs, setTimeLogs] = useState(mockTimeLogs)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeTimer, setActiveTimer] = useState<number | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [newTimeLog, setNewTimeLog] = useState({
    project: '',
    hours: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const handleAddTimeLog = () => {
    const timeLog = {
      id: timeLogs.length + 1,
      date: newTimeLog.date,
      project: mockActiveProjects.find(p => p.id.toString() === newTimeLog.project)?.name || '',
      customer:
        mockActiveProjects.find(p => p.id.toString() === newTimeLog.project)?.customer || '',
      hours: Number.parseFloat(newTimeLog.hours),
      description: newTimeLog.description,
      status: 'Completed',
    }
    setTimeLogs([timeLog, ...timeLogs])
    setNewTimeLog({
      project: '',
      hours: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
    })
    setIsAddDialogOpen(false)
  }

  const handleDeleteTimeLog = (id: number) => {
    setTimeLogs(timeLogs.filter(log => log.id !== id))
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startTimer = (projectId: number) => {
    setActiveTimer(projectId)
    setTimerSeconds(0)
  }

  const stopTimer = () => {
    if (activeTimer && timerSeconds > 0) {
      const hours = (timerSeconds / 3600).toFixed(2)
      const project = mockActiveProjects.find(p => p.id === activeTimer)
      if (project) {
        const timeLog = {
          id: timeLogs.length + 1,
          date: new Date().toISOString().split('T')[0],
          project: project.name,
          customer: project.customer,
          hours: Number.parseFloat(hours),
          description: 'Timer session',
          status: 'Completed',
        }
        setTimeLogs([timeLog, ...timeLogs])
      }
    }
    setActiveTimer(null)
    setTimerSeconds(0)
  }

  // Timer effect
  useState(() => {
    let interval: NodeJS.Timeout
    if (activeTimer !== null) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  })

  const totalHoursToday = timeLogs
    .filter(log => log.date === new Date().toISOString().split('T')[0])
    .reduce((sum, log) => sum + log.hours, 0)

  const totalHoursWeek = timeLogs.reduce((sum, log) => sum + log.hours, 0)

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
                <Label htmlFor="project">Project/Service</Label>
                <Select onValueChange={value => setNewTimeLog({ ...newTimeLog, project: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockActiveProjects.map(project => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name} - {project.customer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input
                    id="hours"
                    type="number"
                    step="0.25"
                    placeholder="e.g., 2.5"
                    value={newTimeLog.hours}
                    onChange={e => setNewTimeLog({ ...newTimeLog, hours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newTimeLog.date}
                    onChange={e => setNewTimeLog({ ...newTimeLog, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Work Description</Label>
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
              <Button onClick={handleAddTimeLog} className="bg-primary hover:bg-primary/90">
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
            <div className="text-2xl font-bold">{totalHoursToday.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Target: 8.0 hours</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursWeek.toFixed(1)}</div>
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
              {activeTimer ? formatTime(timerSeconds) : '00:00:00'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeTimer ? 'Running' : 'No active timer'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Above average</p>
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
              {activeTimer && (
                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-medium mb-2">
                    {mockActiveProjects.find(p => p.id === activeTimer)?.name}
                  </h3>
                  <div className="text-4xl font-mono font-bold text-primary mb-4">
                    {formatTime(timerSeconds)}
                  </div>
                  <Button onClick={stopTimer} variant="outline">
                    <Pause className="mr-2 h-4 w-4" />
                    Stop Timer
                  </Button>
                </div>
              )}

              <div className="grid gap-4">
                {mockActiveProjects.map(project => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium">{project.name}</h4>
                      <p className="text-sm text-muted-foreground">{project.customer}</p>
                    </div>
                    <Button
                      onClick={() => startTimer(project.id)}
                      disabled={activeTimer !== null}
                      variant={activeTimer === project.id ? 'secondary' : 'outline'}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      {activeTimer === project.id ? 'Active' : 'Start Timer'}
                    </Button>
                  </div>
                ))}
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
                            log.status === 'Completed'
                              ? 'bg-green-500/10 text-green-500'
                              : 'bg-blue-500/10 text-blue-500'
                          }
                        >
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
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
                      {totalHoursWeek.toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">Total Hours</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">{timeLogs.length}</div>
                    <p className="text-sm text-muted-foreground">Time Entries</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">94%</div>
                    <p className="text-sm text-muted-foreground">Efficiency Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
