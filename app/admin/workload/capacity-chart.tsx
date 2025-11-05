"use client"

import { useEffect, useState } from "react"
import { getAllWorkloads } from "@/services/workload"
import { Card, CardContent } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

export function CapacityChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    getAllWorkloads().then((res) => setData(res))
  }, [])

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-4">Employee Capacity Utilization (%)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="capacityUtilization" fill="#5038ED" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
