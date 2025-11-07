'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getAllWorkloads, type WorkloadResponse, type Task } from '@/services/workload'
import { Calendar, Clock, User } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function EmployeeSchedule() {
  const [workloads, setWorkloads] = useState<WorkloadResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null)

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    setLoading(true)
    try {
      const data = await getAllWorkloads()
      setWorkloads(data)
      if (data.length > 0) {
        setSelectedEmployee(data[0].employeeId)
      }
    } catch (error) {
      console.error('Failed to load schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedEmployeeData = workloads.find(w => w.employeeId === selectedEmployee)

  const getTaskPriorityColor = (task: Task) => {
    const date = new Date(task.scheduledDate)
    const today = new Date()
    const daysUntil = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntil < 0) return 'destructive'
    if (daysUntil <= 2) return 'default'
    return 'secondary'
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* Employee List */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Employees</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {workloads.map((emp) => (
            <div
              key={emp.employeeId}
              onClick={() => setSelectedEmployee(emp.employeeId)}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                selectedEmployee === emp.employeeId
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-accent'
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {emp.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold text-sm">{emp.name}</p>
                <p className="text-xs opacity-80">{emp.department}</p>
              </div>
              <Badge variant="outline" className={selectedEmployee === emp.employeeId ? 'bg-primary-foreground text-primary' : ''}>
                {emp.upcomingTasks?.length || 0}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Schedule Details */}
      <Card className="md:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedEmployeeData?.name || 'Select Employee'} - Upcoming Schedule
            </CardTitle>
            {selectedEmployeeData && (
              <Badge variant="outline">
                {selectedEmployeeData.upcomingTasks?.length || 0} Tasks
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedEmployeeData ? (
            selectedEmployeeData.upcomingTasks && selectedEmployeeData.upcomingTasks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEmployeeData.upcomingTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{task.type}</Badge>
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {task.customerName}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        {new Date(task.scheduledDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {task.estimatedHours}h
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTaskPriorityColor(task)}>
                          {task.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming tasks scheduled</p>
              </div>
            )
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select an employee to view schedule</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}