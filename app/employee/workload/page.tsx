"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"

// Mock data
const weeklyHours = [
  { day: "Mon", planned: 8, actual: 8.5, efficiency: 106 },
  { day: "Tue", planned: 8, actual: 7.5, efficiency: 94 },
  { day: "Wed", planned: 8, actual: 8.2, efficiency: 103 },
  { day: "Thu", planned: 8, actual: 6.8, efficiency: 85 },
  { day: "Fri", planned: 8, actual: 8.0, efficiency: 100 },
  { day: "Sat", planned: 4, actual: 4.2, efficiency: 105 },
  { day: "Sun", planned: 0, actual: 0, efficiency: 0 },
]

const monthlyTrend = [
  { week: "Week 1", hours: 42, efficiency: 95 },
  { week: "Week 2", hours: 38, efficiency: 88 },
  { week: "Week 3", hours: 44, efficiency: 102 },
  { week: "Week 4", hours: 41, efficiency: 94 },
]

const taskBreakdown = [
  { name: "Oil Changes", hours: 12, color: "#3b82f6" },
  { name: "Brake Services", hours: 8, color: "#10b981" },
  { name: "Custom Projects", hours: 15, color: "#f59e0b" },
  { name: "Inspections", hours: 6, color: "#ef4444" },
  { name: "Diagnostics", hours: 4, color: "#8b5cf6" },
]

const currentWorkload = [
  {
    id: 1,
    project: "Custom Exhaust System",
    customer: "Sarah Johnson",
    priority: "High",
    progress: 65,
    estimatedHours: 8,
    loggedHours: 5.2,
    dueDate: "2024-01-20",
  },
  {
    id: 2,
    project: "Oil Change",
    customer: "John Smith",
    priority: "Medium",
    progress: 80,
    estimatedHours: 0.5,
    loggedHours: 0.4,
    dueDate: "2024-01-15",
  },
  {
    id: 3,
    project: "AC Service",
    customer: "Bob Davis",
    priority: "Low",
    progress: 25,
    estimatedHours: 2,
    loggedHours: 0.5,
    dueDate: "2024-01-22",
  },
]

export default function WorkloadPage() {
  const totalHoursThisWeek = weeklyHours.reduce((sum, day) => sum + day.actual, 0)
  const averageEfficiency = weeklyHours.reduce((sum, day) => sum + day.efficiency, 0) / weeklyHours.length
  const totalTaskHours = taskBreakdown.reduce((sum, task) => sum + task.hours, 0)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-500"
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500"
      case "Low":
        return "bg-green-500/10 text-green-500"
      default:
        return "bg-gray-500/10 text-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Workload & Analytics</h1>
          <p className="text-muted-foreground text-balance">Monitor your productivity and manage your work capacity.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursThisWeek.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Target: 44h</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageEfficiency.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">Above target</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentWorkload.length}</div>
            <p className="text-xs text-muted-foreground">1 high priority</p>
          </CardContent>
        </Card>

        <Card className="border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">Optimal range</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Workload</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Active Projects */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Current assignments and their progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentWorkload.map((project) => (
                  <div key={project.id} className="space-y-3 p-4 border border-border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{project.project}</h4>
                        <p className="text-sm text-muted-foreground">{project.customer}</p>
                      </div>
                      <Badge variant="secondary" className={getPriorityColor(project.priority)}>
                        {project.priority}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>
                        Time: {project.loggedHours}h / {project.estimatedHours}h
                      </span>
                      <span>Due: {project.dueDate}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Task Distribution */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Task Distribution</CardTitle>
                <CardDescription>Hours spent by service type this month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={taskBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="hours"
                    >
                      {taskBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {taskBreakdown.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span>
                        {item.hours}h ({((item.hours / totalTaskHours) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Hours */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Weekly Hours Breakdown</CardTitle>
                <CardDescription>Planned vs actual hours worked</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyHours}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="planned" fill="#e5e7eb" name="Planned" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Efficiency Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Daily Efficiency</CardTitle>
                <CardDescription>Efficiency percentage by day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyHours}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="efficiency" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Track your performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrend}>
                  <XAxis dataKey="week" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Bar yAxisId="left" dataKey="hours" fill="#3b82f6" name="Hours" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Efficiency %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Weekly Hours</span>
                  <span className="font-medium">41.3h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average Efficiency</span>
                  <span className="font-medium">94.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Projects Completed</span>
                  <span className="font-medium">28</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Customer Rating</span>
                  <span className="font-medium">4.9/5</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Goals Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Monthly Hours Target</span>
                    <span>165/180h</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Efficiency Target</span>
                    <span>94/95%</span>
                  </div>
                  <Progress value={99} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Customer Satisfaction</span>
                    <span>4.9/5.0</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Great efficiency this week! Keep up the excellent work.
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Consider taking on more custom projects to increase revenue.
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Thursday's efficiency was low. Review time allocation.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
