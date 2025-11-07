'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getAllWorkloads, type WorkloadResponse } from '@/services/workload'
import { Users, Clock, AlertTriangle, CheckCircle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function WorkloadOverview() {
  const [workloads, setWorkloads] = useState<WorkloadResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadWorkloads = async () => {
      setLoading(true)
      setError(null)
      try {
        const data = await getAllWorkloads()
        setWorkloads(data)
      } catch (err: any) {
        setError(err?.message || 'Failed to load workloads')
      } finally {
        setLoading(false)
      }
    }
    loadWorkloads()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'busy':
        return 'bg-yellow-500'
      case 'overloaded':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'busy':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'overloaded':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Users className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {workloads.map((emp) => (
        <Card key={emp.employeeId} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>
                    {emp.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-base">{emp.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{emp.department}</p>
                </div>
              </div>
              {getStatusIcon(emp.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Capacity Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Capacity</span>
                <span className="font-semibold">{emp.capacityUtilization}%</span>
              </div>
              <Progress 
                value={emp.capacityUtilization} 
                className={`h-2 ${emp.capacityUtilization > 90 ? 'bg-red-200' : ''}`}
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="font-semibold">{emp.hoursLoggedThisWeek}h</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Active Tasks</p>
                  <p className="font-semibold">
                    {emp.activeAppointments + emp.activeProjects}
                  </p>
                </div>
              </div>
            </div>

            {/* Task Breakdown */}
            <div className="flex gap-2 text-xs">
              <Badge variant="outline" className="flex-1 justify-center">
                {emp.activeAppointments} Appointments
              </Badge>
              <Badge variant="outline" className="flex-1 justify-center">
                {emp.activeProjects} Projects
              </Badge>
            </div>

            {/* Status Badge */}
            <Badge 
              className={`w-full justify-center ${getStatusColor(emp.status)} text-white`}
            >
              {emp.status.toUpperCase()}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}