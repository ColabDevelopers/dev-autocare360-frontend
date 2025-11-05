"use client"

import { useEffect, useState } from "react"
import { getAllWorkloads, assignTask } from "@/services/workload"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function TaskAssignment() {
  const [employees, setEmployees] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [workItemId, setWorkItemId] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getAllWorkloads().then(setEmployees)
  }, [])

  const handleAssign = async () => {
    if (!selected || !workItemId) return alert("Please enter a Work Item ID.")
    setLoading(true)
    try {
      await assignTask({ workItemId: Number(workItemId), employeeId: selected })
      alert("Task assigned successfully!")
      setOpen(false)
    } catch {
      alert("Failed to assign task.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead className="bg-[#f4f4f9] text-[#5038ED]">
              <tr>
                <th className="p-3 text-left">Employee</th>
                <th className="p-3 text-left">Department</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Assign Task</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.employeeId} className="border-b hover:bg-gray-50">
                  <td className="p-3">{emp.name}</td>
                  <td className="p-3">{emp.department}</td>
                  <td className="p-3 capitalize">{emp.status}</td>
                  <td className="p-3">
                    <Dialog open={open && selected === emp.employeeId} onOpenChange={setOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="border-[#5038ED] text-[#5038ED]"
                          onClick={() => setSelected(emp.employeeId)}
                        >
                          Assign
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Assign Task to {emp.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            type="number"
                            placeholder="Enter Work Item ID"
                            value={workItemId}
                            onChange={(e) => setWorkItemId(e.target.value)}
                          />
                          <Button
                            className="bg-[#5038ED] text-white w-full"
                            onClick={handleAssign}
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="animate-spin mr-2" size={16} />
                            ) : null}
                            Assign
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
