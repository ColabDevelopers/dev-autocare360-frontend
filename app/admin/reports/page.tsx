'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  getSummary,
  getRevenueTrend,
  getServiceTypes,
  getPerformanceMetrics
} from '@/services/reports'
import { RefreshCw, TrendingUp, Users, Car, DollarSign, Calendar } from 'lucide-react'

export default function ReportsAnalytics() {

  const [summary, setSummary] = useState<any>(null)
  const [revenueTrend, setRevenueTrend] = useState<any[]>([])
  const [serviceTypes, setServiceTypes] = useState<any[]>([])
  const [performance, setPerformance] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAllReports()
  }, [])

  const loadAllReports = async () => {
    setLoading(true)
    try {
      const [sum, rev, types, perf] = await Promise.all([
        getSummary(),
        getRevenueTrend(),
        getServiceTypes(),
        getPerformanceMetrics()
      ])

      setSummary(sum)
      setRevenueTrend(
        rev.map((r: any) => ({
          month: r.month,
          revenue: r.revenue,
          services: Math.floor(r.revenue / 1000) // simple logic
        }))
      )
      setServiceTypes(types)
      setPerformance(perf)

    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="space-y-6">
      
      {/* KPIs */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Total Revenue */}
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                Rs. {summary.totalRevenue.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          {/* Services Completed */}
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Services Completed</CardTitle>
              <Car className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.servicesCompleted}
              </div>
            </CardContent>
          </Card>

          {/* Customer Satisfaction */}
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Customer Satisfaction</CardTitle>
              <Users className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.customerSatisfaction}/5
              </div>
            </CardContent>
          </Card>

          {/* Avg Service Time */}
          <Card>
            <CardHeader className="flex justify-between pb-2">
              <CardTitle className="text-sm">Avg. Service Time</CardTitle>
              <Calendar className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.avgServiceTime} hrs
              </div>
            </CardContent>
          </Card>

        </div>
      )}

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Real-time monthly revenue</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" name="Revenue (Rs.)" />
              <Bar dataKey="services" fill="#10b981" name="Services" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Service Type Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Service Type Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={serviceTypes}
                cx="50%"
                cy="50%"
                outerRadius={110}
                dataKey="percentage"
                label={({ name, percentage }) => `${name} : ${percentage}%`}
              >
                {serviceTypes.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {performance.map((p, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between">
                  <span>{p.metric}</span>
                  <span>{p.value}%</span>
                </div>
                <Progress value={p.value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
