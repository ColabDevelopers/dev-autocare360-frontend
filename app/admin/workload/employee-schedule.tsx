"use client"

import { useEffect, useState } from "react"
import { getEmployeeAvailability } from "@/services/workload"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function EmployeeSchedule() {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        const res = await getEmployeeAvailability()
        setData(res)
      } finally {
        setLoading(false)
      }
    }
    fetchAvailability()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-[#5038ED]" />
      </div>
    )
  }

  if (!data.length)
    return <p className="text-center text-gray-500">No employee schedules available.</p>

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4 overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-[#f4f4f9] text-[#5038ED]">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th className="p-3 text-left">Next Task</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Estimated Hours</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((emp) => (
              <tr key={emp.employeeId} className="border-b hover:bg-gray-50">
                <td className="p-3">{emp.name}</td>
                <td className="p-3">{emp.upcomingTask || "—"}</td>
                <td className="p-3">{emp.scheduledDate || "—"}</td>
                <td className="p-3">{emp.estimatedHours || 0}</td>
                <td className="p-3">{emp.status || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
