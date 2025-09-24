"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
} from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"

// Mock data
const mockAssignedJobs = [
  {
    id: 1,
    type: "Oil Change",
    customer: "John Smith",
    vehicle: "Toyota Camry 2020",
    progress: 75,
    status: "In Progress",
    estimatedHours: 0.5,
    loggedHours: 0.4,
    dueDate: "2024-01-15",
  },
  {
    id: 2,
    type: "Custom Exhaust System",
    customer: "Sarah Johnson",
    vehicle: "Toyota Camry 2020",
    progress: 45,
    status: "In Progress",
    estimatedHours: 8,
    loggedHours: 3.6,
    dueDate: "2024-01-20",
  },
  {
    id: 3,
    type: "Brake Inspection",
    customer: "Mike Wilson",
    vehicle: "Honda Civic 2019",
    progress: 100,
    status: "Completed",
    estimatedHours: 2,
    loggedHours: 1.8,
    dueDate: "2024-01-10",
  },
]

const mockUpcomingAppointments = [
  {
    id: 1,
    service: "Tire Rotation",
    customer: "Alice Brown",
    time: "10:00 AM",
    vehicle: "Ford F-150 2021",
  },
  {
    id: 2,
    service: "AC Service",
    customer: "Bob Davis",
    time: "2:00 PM",
    vehicle: "BMW X5 2020",
  },
]

const workloadData = [
  { name: "Mon", hours: 8 },
  { name: "Tue", hours: 7.5 },
  { name: "Wed", hours: 8 },
  { name: "Thu", hours: 6 },
  { name: "Fri", hours: 8 },
  { name: "Sat", hours: 4 },
  { name: "Sun", hours: 0 },
]

const taskDistribution = [
  { name: "Oil Changes", value: 35, color: "#3b82f6" },
  { name: "Brake Services", value: 25, color: "#10b981" },
  { name: "Custom Projects", value: 20, color: "#f59e0b" },
  { name: "Inspections", value: 20, color: "#ef4444" },
]

export default function EmployeeDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [activeTimer, setActiveTimer] = useState<number | null>(null)
  const [timerSeconds, setTimerSeconds] = useState(0)

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (activeTimer !== null) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [activeTimer])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const startTimer = (jobId: number) => {
    setActiveTimer(jobId)
    setTimerSeconds(0)
  }

  const stopTimer = () => {
    setActiveTimer(null)
    setTimerSeconds(0)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-500"
      case "In Progress":
        return "bg-blue-500"
      case "Pending":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "In Progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Good morning, Technician!</h1>
          <p className="text-muted-foreground text-balance">You have 3 active jobs and 2 appointments today.</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Clock className="mr-2 h-4 w-4" />
            Clock In
          </Button>
          <Button className="bg-primary hover:bg-primary/90">
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
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 in progress</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.5</div>
            <p className="text-xs text-muted-foreground">Target: 8 hours</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">Above average</p>
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
              {mockAssignedJobs.map((job) => (
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
                    <Badge variant="secondary" className={`${getStatusColor(job.status)} text-white`}>
                      {job.status}
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
                    <span>Due: {job.dueDate}</span>
                  </div>

                  {/* Timer Section */}
                  {activeTimer === job.id && (
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Active Timer</span>
                        <span className="font-mono text-lg">{formatTime(timerSeconds)}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    {job.status === "In Progress" && (
                      <>
                        {activeTimer === job.id ? (
                          <Button variant="outline" size="sm" onClick={stopTimer}>
                            <Pause className="mr-1 h-3 w-3" />
                            Stop Timer
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => startTimer(job.id)}>
                            <Play className="mr-1 h-3 w-3" />
                            Start Timer
                          </Button>
                        )}
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      Update Status
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MessageCircle className="mr-1 h-3 w-3" />
                      Contact Customer
                    </Button>
                  </div>
                </div>
              ))}
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
              <div className="space-y-3">
                {mockUpcomingAppointments.map((appointment) => (
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
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.time}</p>
                      <Button variant="outline" size="sm" className="mt-1 bg-transparent">
                        Start Job
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={workloadData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Distribution */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Task Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={taskDistribution}
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
                {taskDistribution.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span>{item.name}</span>
                    </div>
                    <span>{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
