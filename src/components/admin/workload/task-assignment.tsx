"use client";

import {
  UnassignedTaskDto,
  EmployeeListDto,
  assignTask,
  TaskAssignmentRequest,
} from "@/services/workload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface TaskAssignmentProps {
  tasks: UnassignedTaskDto[];
  employees: EmployeeListDto[];
  onChanged: () => void; // callback to refresh data
}

export function TaskAssignment({
  tasks,
  employees,
  onChanged,
}: TaskAssignmentProps) {
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<
    Record<number, number | null>
  >({});

  const handleAssign = async (taskId: number) => {
    const employeeId = selectedEmployee[taskId];
    if (!employeeId) return;

    setAssigningId(taskId);
    const payload: TaskAssignmentRequest = { taskId, employeeId };

    try {
      await assignTask(payload);
      onChanged();
    } finally {
      setAssigningId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-sm">Task Assignment</CardTitle>
          <p className="text-xs text-muted-foreground">
            Assign unallocated work items to employees
          </p>
        </div>
        <Badge variant="outline" className="text-[11px]">
          {tasks.length} Unassigned
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border rounded-md px-3 py-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <div className="text-sm font-medium">{task.title}</div>
              <div className="text-[11px] text-muted-foreground">
                Customer: {task.customerName} • {task.type} • {task.estimatedHours}
                h • Due {task.dueDate}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <Select
                value={
                  selectedEmployee[task.id]
                    ? String(selectedEmployee[task.id])
                    : ""
                }
                onValueChange={(value) =>
                  setSelectedEmployee((prev) => ({
                    ...prev,
                    [task.id]: Number(value),
                  }))
                }
              >
                <SelectTrigger className="h-8 w-[160px] text-xs">
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((e) => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                className="h-8 text-xs"
                disabled={assigningId === task.id || !selectedEmployee[task.id]}
                onClick={() => handleAssign(task.id)}
              >
                {assigningId === task.id ? "Assigning..." : "Assign"}
              </Button>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-xs text-muted-foreground border border-dashed rounded-md py-6 text-center">
            All tasks are assigned ✅
          </div>
        )}
      </CardContent>
    </Card>
  );
}
