"use client";

import { WorkloadResponse, WorkloadSummaryDto } from "@/services/workload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";

interface WorkloadOverviewProps {
  employees: WorkloadResponse[];
  summary: WorkloadSummaryDto | null;
  selectedId: number | null;
  onSelect: (id: number) => void;
}

export function WorkloadOverview({
  employees = [],
  summary,
  selectedId,
  onSelect,
}: WorkloadOverviewProps) {
const totalEmployees = summary?.totalEmployees ?? employees?.length ?? 0;
  const avgCapacity = summary?.averageCapacity ?? 0;
  const activeItems = summary?.activeWorkItems ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <SummaryTile
          label="Total Employees"
          value={totalEmployees.toString()}
          icon={<Users className="h-4 w-4" />}
        />
        <SummaryTile
          label="Avg Capacity"
          value={`${avgCapacity.toFixed(0)}%`}
        />
        <SummaryTile label="Active Work Items" value={activeItems.toString()} />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((emp) => (
          <EmployeeCard
            key={emp.employeeId}
            employee={emp}
            isSelected={selectedId === emp.employeeId}
            onSelect={() => onSelect(emp.employeeId)}
          />
        ))}

        {employees.length === 0 && (
          <Card className="border-dashed border-muted flex items-center justify-center h-40">
            <span className="text-muted-foreground text-sm">
              No employees found. Assign tasks or create employees to see
              workload.
            </span>
          </Card>
        )}
      </div>
    </div>
  );
}

interface SummaryTileProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

function SummaryTile({ label, value, icon }: SummaryTileProps) {
  return (
    <Card className="flex-1 min-w-[160px]">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

interface EmployeeCardProps {
  employee: WorkloadResponse;
  isSelected: boolean;
  onSelect: () => void;
}

function EmployeeCard({ employee, isSelected, onSelect }: EmployeeCardProps) {
  const capacity = Math.round(employee.capacityUtilization ?? 0);
  const hoursThisWeek = employee.hoursLoggedThisWeek ?? 0;
  const activeTasks = employee.activeAppointments ?? 0;

  const status = (employee.workloadStatus || "").toUpperCase();
  let statusColor =
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";

  if (status === "BUSY") {
    statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  } else if (status === "OVERLOADED") {
    statusColor = "bg-red-500/10 text-red-400 border-red-500/30";
  }

  return (
    <Card
      onClick={onSelect}
      className={cn(
        "cursor-pointer transition-all hover:border-primary/60",
        isSelected && "ring-2 ring-primary/70 border-primary shadow-lg"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">
              {employee.name}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {employee.department}
            </p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] px-2 py-0.5 border rounded-full",
              statusColor
            )}
          >
            {status || "AVAILABLE"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Capacity</span>
            <span>{capacity}%</span>
          </div>
          <Progress value={capacity} className="h-1.5" />
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <div>
            <div className="font-medium text-foreground">
              {hoursThisWeek.toFixed(1)}h
            </div>
            <div className="text-[11px]">This Week</div>
          </div>
          <div className="text-right">
            <div className="font-medium text-foreground">
              {activeTasks.toString()}
            </div>
            <div className="text-[11px]">Active Tasks</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
