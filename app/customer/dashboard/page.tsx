"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Separator } from "@/components/ui/separator"
import { Car, CalendarIcon, Clock, Wrench, CheckCircle, AlertCircle, TrendingUp, Plus } from "lucide-react"
import { LiveProgress } from "@/components/real-time/live-progress"

// Mock data
const mockServices = [
  {
    id: 1,
    type: "Oil Change",
    vehicle: "Toyota Camry 2020",
    progress: 75,
    status: "In Progress",
    estimatedCompletion: "2024-01-15",
    technician: "Mike Johnson",
  },
  {
    id: 2,
    type: "Brake Inspection",
    vehicle: "Honda Civic 2019",
    progress: 100,
    status: "Completed",
    estimatedCompletion: "2024-01-10",
    technician: "Sarah Wilson",
  },
  {
    id: 3,
    type: "Custom Exhaust System",
    vehicle: "Toyota Camry 2020",
    progress: 45,
    status: "In Progress",
    estimatedCompletion: "2024-01-20",
    technician: "Alex Rodriguez",
  },
]

const mockUpcomingAppointments = [
  {
    id: 1,
    service: "Tire Rotation",
    date: "2024-01-18",
    time: "10:00 AM",
    vehicle: "Toyota Camry 2020",
  },
  {
    id: 2,
    service: "AC Service",
    date: "2024-01-22",
    time: "2:00 PM",
    vehicle: "Honda Civic 2019",
  },
]

export default function CustomerDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Oil change completed for Toyota Camry", time: "2 hours ago", type: "success" },
    { id: 2, message: "Brake inspection scheduled for tomorrow", time: "1 day ago", type: "info" },
    { id: 3, message: "Custom exhaust project update available", time: "3 hours ago", type: "update" },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) => [
        {
          id: Date.now(),
          message: "Service progress updated",
          time: "Just now",
          type: "update",
        },
        ...prev.slice(0, 4),
      ])
    }, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

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
          <h1 className="text-3xl font-bold text-foreground text-balance">Welcome back!</h1>
          <p className="text-muted-foreground text-balance">Here's what's happening with your vehicles today.</p>
        </div>
        <div className="flex space-x-2">
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              console.log("[v0] Book Service clicked from dashboard")
              window.location.href = "/customer/appointments"
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Book Service
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              console.log("[v0] Request Project clicked from dashboard")
              window.location.href = "/customer/projects"
            }}
          >
            <Wrench className="mr-2 h-4 w-4" />
            Request Project
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Services</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Registered</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Service</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Jan 18</div>
            <p className="text-xs text-muted-foreground">Tire Rotation</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Services */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5" />
                <span>Current Services & Projects</span>
              </CardTitle>
              <CardDescription>Track the progress of your ongoing services in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <LiveProgress />
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5" />
                <span>Upcoming Appointments</span>
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
                        <p className="text-sm text-muted-foreground">{appointment.vehicle}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{appointment.date}</p>
                      <p className="text-sm text-muted-foreground">{appointment.time}</p>
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

          {/* Recent Notifications */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Recent Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === "success"
                            ? "bg-green-500"
                            : notification.type === "info"
                              ? "bg-blue-500"
                              : "bg-yellow-500"
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                    {index < notifications.length - 1 && <Separator className="my-3" />}
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
