'use client'

import { WorkloadOverview } from '@/components/admin/workload/workload-overview'
import { CapacityChart } from '@/components/admin/workload/capacity-chart'
import { TaskAssignment } from '@/components/admin/workload/task-assignment'
import { EmployeeSchedule } from '@/components/admin/workload/employee-schedule'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download } from 'lucide-react'
import { useState } from 'react'

export default function WorkloadMonitoringPage() {
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    // Trigger refresh in child components by forcing re-mount
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
    window.location.reload() // Simple refresh - you can implement better state management
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Workload Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor employee workload and optimize task distribution
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Workload Overview Cards */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
        <WorkloadOverview />
      </div>

      {/* Capacity Charts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Capacity Analytics</h2>
        <CapacityChart />
      </div>

      {/* Task Assignment */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Task Management</h2>
        <TaskAssignment />
      </div>

      {/* Employee Schedule */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Employee Schedules</h2>
        <EmployeeSchedule />
      </div>
    </div>
  )
}