"use client";

import {
  DailyScheduleDto,
  EmployeeListDto,
  EmployeeScheduleDto,
} from "@/services/workload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface EmployeeScheduleProps {
  employees: EmployeeListDto[];
  selectedEmployeeId: number | null;
  schedule: EmployeeScheduleDto | null;
  onSelectEmployee: (id: number) => void;
}

export function EmployeeSchedule({
  employees,
  selectedEmployeeId,
  schedule,
  onSelectEmployee,
}: EmployeeScheduleProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[2fr,3fr]">
      {/* LEFT: EMPLOYEE LIST */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Employees</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-64 overflow-y-auto">
            {employees.map((emp) => (
              <button
                key={emp.id}
                onClick={() => onSelectEmployee(emp.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b flex items-center justify-between hover:bg-muted/60 transition-colors",
                  selectedEmployeeId === emp.id && "bg-muted"
                )}
              >
                <div>
                  <div className="text-sm font-medium">{emp.name}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {emp.department}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="outline" className="text-[10px] px-2 py-0">
                    {emp.status}
                  </Badge>
                  <div className="text-[11px] text-muted-foreground">
                    {emp.activeTaskCount} active •{" "}
                    {Math.round(emp.capacityUtilization ?? 0)}%
                  </div>
                </div>
              </button>
            ))}

            {employees.length === 0 && (
              <div className="h-32 flex items-center justify-center text-xs text-muted-foreground">
                No employees to show.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RIGHT: SCHEDULE */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            {schedule
              ? `${schedule.name} - Upcoming Schedule`
              : "Select an employee - Upcoming Schedule"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {schedule && schedule.upcomingSchedule.length > 0 ? (
            <div className="h-64 overflow-y-auto">
              <div className="divide-y">
                {schedule.upcomingSchedule.map((day) => (
                  <DayRow key={day.date} day={day} />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground">
              <div className="mb-2 text-3xl">📅</div>
              No upcoming tasks scheduled.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function DayRow({ day }: { day: DailyScheduleDto }) {
  return (
    <div className="px-4 py-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          {day.dayOfWeek}{" "}
          <span className="text-[11px] text-muted-foreground">
            ({day.date})
          </span>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Total {day.totalHours.toFixed(1)}h
        </div>
      </div>

      <div className="space-y-1">
        {day.tasks.map((t) => (
          <div
            key={t.taskId}
            className="text-[11px] flex items-center justify-between rounded-md border px-2 py-1 bg-muted/40"
          >
            <div>
              <div className="font-medium text-xs">{t.taskName}</div>
              <div className="text-[10px] text-muted-foreground">
                {t.startTime} – {t.endTime} • {t.customerName}
              </div>
            </div>
            <Badge variant="outline" className="text-[9px] px-2 py-0">
              {t.status}
            </Badge>
          </div>
        ))}
        {day.tasks.length === 0 && (
          <div className="text-[11px] text-muted-foreground italic">
            No tasks for this day.
          </div>
        )}
      </div>
    </div>
  );
}
