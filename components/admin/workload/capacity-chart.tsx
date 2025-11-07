'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getCapacityMetrics, getAllWorkloads, type CapacityMetrics } from '@/services/workload'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Users, TrendingUp, AlertCircle } from 'lucide-react'

export function CapacityChart() {
  const [metrics, setMetrics] = useState<CapacityMetrics | null>(null)
  const [workloads, setWorkloads] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [metricsData, workloadData] = await Promise.all([
          getCapacityMetrics(),
          getAllWorkloads(),
        ])
        setMetrics(metricsData)
        setWorkloads(workloadData)
      } catch (error) {
        console.error('Failed to load capacity data:', error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading || !metrics) {
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

  // Prepare data for charts
  const capacityData = workloads.map((emp) => ({
    name: emp.name.split(' ')[0], // First name only
    capacity: emp.capacityUtilization,
    hours: emp.hoursLoggedThisWeek,
  }))

  const statusData = [
    { name: 'Available', value: metrics.availableEmployees, color: '#10b981' },
    { name: 'Busy', value: metrics.busyEmployees, color: '#f59e0b' },
    { name: 'Overloaded', value: metrics.overloadedEmployees, color: '#ef4444' },
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Capacity Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Capacity Distribution</CardTitle>
          <CardDescription>Current workload across all employees</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={capacityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Capacity %', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Bar 
                dataKey="capacity" 
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Team Status Overview</CardTitle>
          <CardDescription>Employee availability status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Summary Stats */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{metrics.availableEmployees}</p>
              <p className="text-xs text-muted-foreground">Available</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{metrics.busyEmployees}</p>
              <p className="text-xs text-muted-foreground">Busy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{metrics.overloadedEmployees}</p>
              <p className="text-xs text-muted-foreground">Overloaded</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Workload Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalEmployees}</p>
                <p className="text-sm text-muted-foreground">Total Employees</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.averageCapacity}%</p>
                <p className="text-sm text-muted-foreground">Avg Capacity</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{metrics.totalActiveWorkItems}</p>
                <p className="text-sm text-muted-foreground">Active Work Items</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round((metrics.busyEmployees / metrics.totalEmployees) * 100)}%
                </p>
                <p className="text-sm text-muted-foreground">Utilization Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}