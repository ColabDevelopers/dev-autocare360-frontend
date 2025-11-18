"use client";

import {
  CapacityDistributionDto,
  TeamStatusDto,
} from "@/services/workload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface CapacityChartProps {
  data: CapacityDistributionDto[];
  teamStatus: TeamStatusDto | null;
}

export function CapacityChart({ data, teamStatus }: CapacityChartProps) {
  const safeData =
    data?.map((d) => ({
      name: d.name,
      capacity: d.value ?? 0,
      status: (d.status || "").toUpperCase(),
    })) ?? [];

  const available = teamStatus?.availableCount ?? 0;
  const busy = teamStatus?.busyCount ?? 0;
  const overloaded = teamStatus?.overloadedCount ?? 0;
  const total = available + busy + overloaded;

  return (
    <div className="grid gap-4 lg:grid-cols-[3fr,2fr]">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Employee Capacity Distribution
          </CardTitle>
          <p className="text-xs text-muted-foreground">
            Current workload across all employees
          </p>
        </CardHeader>
        <CardContent className="h-64">
          {safeData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-muted-foreground border border-dashed rounded-md">
              No workload data yet. Assign tasks to employees to see capacity.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={safeData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 120]}
                />
                <Tooltip
                  formatter={(value: any) => `${value}%`}
                  labelStyle={{ fontSize: 12 }}
                  contentStyle={{ fontSize: 12 }}
                />
                <Bar dataKey="capacity" radius={[4, 4, 0, 0]}>
                  {safeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.status === "OVERLOADED"
                          ? "#ef4444"
                          : entry.status === "BUSY"
                          ? "#f97316"
                          : "#22c55e"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Team Status Overview</CardTitle>
          <p className="text-xs text-muted-foreground">
            Employee availability status
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <StatusPill label="Available" value={available} color="green" />
            <StatusPill label="Busy" value={busy} color="amber" />
            <StatusPill label="Overloaded" value={overloaded} color="red" />
          </div>

          <div className="border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Total Employees</span>
              <span>{total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatusPillProps {
  label: string;
  value: number;
  color: "green" | "amber" | "red";
}

function StatusPill({ label, value, color }: StatusPillProps) {
  const map: Record<typeof color, string> = {
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    red: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <div
      className={`border rounded-lg py-2 px-2 flex flex-col items-center justify-center ${map[color]}`}
    >
      <div className="text-[11px]">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}
