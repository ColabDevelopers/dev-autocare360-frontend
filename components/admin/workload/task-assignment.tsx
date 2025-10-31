'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserPlus, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { assignTask, getAllWorkloads, type WorkloadResponse } from '@/services/workload'
import { toast } from 'sonner'

interface UnassignedTask {
  id: number
  workItemId: number
  title: string
  type: 'appointment' | 'project'
  customerName: string
  estimatedHours: number
  priority: 'low' | 'medium' | 'high'
  scheduledDate: string
}

// Mock unassigned tasks - Replace with actual API call when backend is ready
const mockUnassignedTasks: UnassignedTask[] = [
  {
    id: 1,
    workItemId: 101,
    title: 'Oil Change & Filter Replacement',
    type: 'appointment',
    customerName: 'John Doe',
    estimatedHours: 2,
    priority: 'medium',
    scheduledDate: '2025-11-01',
  },
  {
    id: 2,
    workItemId: 102,
    title: 'Custom Paint Job',
    type: 'project',
    customerName: 'Jane Smith',
    estimatedHours: 40,
    priority: 'high',
    scheduledDate: '2025-11-05',
  },
  {
    id: 3,
    workItemId: 103,
    title: 'Brake System Repair',
    type: 'appointment',
    customerName: 'Mike Johnson',
    estimatedHours: 4,
    priority: 'high',
    scheduledDate: '2025-11-02',
  },
]

export function TaskAssignment() {
  const [open, setOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<UnassignedTask | null>(null)
  const [employees, setEmployees] = useState<WorkloadResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [assigning, setAssigning] = useState(false)

  useEffect(() => {
    if (open && selectedTask) {
      loadEmployees()
    }
  }, [open, selectedTask])

  const loadEmployees = async () => {
    setLoading(true)
    try {
      const data = await getAllWorkloads()
      // Sort by capacity (lowest first for better assignment)
      setEmployees(data.sort((a, b) => a.capacityUtilization - b.capacityUtilization))
    } catch (error) {
      console.error('Failed to load employees:', error)
      toast.error('Failed to load employee list')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (employeeId: number) => {
    if (!selectedTask) return

    setAssigning(true)
    try {
      await assignTask({
        workItemId: selectedTask.workItemId,
        employeeId,
        roleOnJob: 'Technician',
      })
      toast.success('Task assigned successfully!')
      setOpen(false)
      setSelectedTask(null)
      // Refresh the employee list
      await loadEmployees()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to assign task')
    } finally {
      setAssigning(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'default'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getRecommendedEmployee = () => {
    if (employees.length === 0) return null
    // Recommend employee with lowest capacity
    return employees[0]
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Task Assignment</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Assign unassigned work items to employees
            </p>
          </div>
          <Badge variant="outline" className="text-lg">
            {mockUnassignedTasks.length} Unassigned
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockUnassignedTasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{task.title}</h4>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline">{task.type}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Customer: {task.customerName}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {task.estimatedHours}h
                  </span>
                  <span>Due: {new Date(task.scheduledDate).toLocaleDateString()}</span>
                </div>
              </div>

              <Dialog open={open && selectedTask?.id === task.id} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => setSelectedTask(task)}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Assign
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Assign Task to Employee</DialogTitle>
                    <DialogDescription>
                      Select an employee to assign this task. Employees are sorted by current workload.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Task Details */}
                    <div className="p-4 bg-accent/50 rounded-lg">
                      <h4 className="font-semibold mb-2">{selectedTask?.title}</h4>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Customer: {selectedTask?.customerName}</span>
                        <span>Estimated: {selectedTask?.estimatedHours}h</span>
                      </div>
                    </div>

                    {/* Employee List */}
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading employees...
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {employees.map((emp, index) => {
                          const isRecommended = index === 0
                          return (
                            <div
                              key={emp.employeeId}
                              className={`flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
                                isRecommended ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <Avatar>
                                  <AvatarImage src="/placeholder.svg" />
                                  <AvatarFallback>
                                    {emp.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-semibold">{emp.name}</h5>
                                    {isRecommended && (
                                      <Badge variant="outline" className="bg-green-500 text-white">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Recommended
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {emp.department} • {emp.activeAppointments + emp.activeProjects} active tasks
                                  </p>
                                  <div className="mt-2 flex items-center gap-2">
                                    <div className="flex-1">
                                      <div className="flex justify-between text-xs mb-1">
                                        <span>Capacity</span>
                                        <span>{emp.capacityUtilization}%</span>
                                      </div>
                                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full ${
                                            emp.capacityUtilization > 90
                                              ? 'bg-red-500'
                                              : emp.capacityUtilization > 70
                                              ? 'bg-yellow-500'
                                              : 'bg-green-500'
                                          }`}
                                          style={{ width: `${emp.capacityUtilization}%` }}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAssign(emp.employeeId)}
                                disabled={assigning || emp.capacityUtilization > 95}
                              >
                                {assigning ? 'Assigning...' : 'Assign'}
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          ))}

          {mockUnassignedTasks.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>All tasks are assigned!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}