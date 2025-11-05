"use client"

import { useEffect, useState } from "react"
import { getCapacityMetrics } from "@/services/workload"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export function WorkloadOverview() {
  const [metrics, setMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getCapacityMetrics()
        setMetrics(data)
      } finally {
        setLoading(false)
      }
    }
    fetchMetrics()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-[#5038ED]" />
      </div>
    )
  }

  if (!metrics) return <p className="text-center text-gray-500">No data available.</p>

  const cards = [
    { title: "Total Employees", value: metrics.totalEmployees, color: "#5038ED" },
    { title: "Available", value: metrics.availableEmployees, color: "#65F178" },
    { title: "Busy", value: metrics.busyEmployees, color: "#F1A965" },
    { title: "Overloaded", value: metrics.overloadedEmployees, color: "#F16567" },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.title} className="border border-gray-100 shadow-sm">
          <CardContent className="p-4 text-center">
            <h3 className="text-sm text-gray-600">{card.title}</h3>
            <p className="text-2xl font-bold" style={{ color: card.color }}>
              {card.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
