"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, User, DollarSign } from "lucide-react"

const projects = [
  {
    id: 1,
    title: "Custom Exhaust System",
    customer: "Alex Rodriguez",
    vehicle: "2020 BMW M3",
    status: "In Progress",
    progress: 65,
    startDate: "2024-01-15",
    dueDate: "2024-02-01",
    budget: "$2,500",
    timeLogged: "18.5 hours",
  },
  {
    id: 2,
    title: "Performance Tune",
    customer: "Sarah Johnson",
    vehicle: "2019 Audi RS6",
    status: "Review",
    progress: 90,
    startDate: "2024-01-10",
    dueDate: "2024-01-25",
    budget: "$1,800",
    timeLogged: "12.0 hours",
  },
  {
    id: 3,
    title: "Suspension Upgrade",
    customer: "Mike Chen",
    vehicle: "2021 Porsche 911",
    status: "Planning",
    progress: 15,
    startDate: "2024-02-05",
    dueDate: "2024-02-20",
    budget: "$3,200",
    timeLogged: "2.5 hours",
  },
]

export default function EmployeeProjects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
        <Button>Update Progress</Button>
      </div>

      <div className="grid gap-6">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription>
                    {project.customer} • {project.vehicle}
                  </CardDescription>
                </div>
                <Badge
                  variant={
                    project.status === "In Progress" ? "default" : project.status === "Review" ? "secondary" : "outline"
                  }
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Due Date</p>
                    <p className="font-medium">{project.dueDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Time Logged</p>
                    <p className="font-medium">{project.timeLogged}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Budget</p>
                    <p className="font-medium">{project.budget}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{project.customer}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm">Log Time</Button>
                <Button size="sm" variant="outline">
                  Update Status
                </Button>
                <Button size="sm" variant="outline">
                  Add Notes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
