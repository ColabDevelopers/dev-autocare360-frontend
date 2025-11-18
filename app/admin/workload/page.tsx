"use client";

import { useEffect, useState } from "react";
import {
  fetchCapacityDistribution,
  fetchEmployeeSchedule,
  fetchEmployeeWorkloads,
  fetchScheduleEmployees,
  fetchTeamStatus,
  fetchUnassignedTasks,
  fetchWorkloadSummary,
  CapacityDistributionDto,
  EmployeeListDto,
  EmployeeScheduleDto,
  TeamStatusDto,
  UnassignedTaskDto,
  WorkloadResponse,
  WorkloadSummaryDto,
} from "@/services/workload";
import { WorkloadOverview } from "@/components/admin/workload/workload-overview";
import { CapacityChart } from "@/components/admin/workload/capacity-chart";
import { EmployeeSchedule } from "@/components/admin/workload/employee-schedule";
import { TaskAssignment } from "@/components/admin/workload/task-assignment";
import { Button } from "@/components/ui/button";

export default function AdminWorkloadPage() {
  const [summary, setSummary] = useState<WorkloadSummaryDto | null>(null);
  const [employees, setEmployees] = useState<WorkloadResponse[]>([]);
  const [capacityData, setCapacityData] = useState<CapacityDistributionDto[]>(
    []
  );
  const [teamStatus, setTeamStatus] = useState<TeamStatusDto | null>(null);
  const [unassignedTasks, setUnassignedTasks] = useState<UnassignedTaskDto[]>(
    []
  );
  const [scheduleEmployees, setScheduleEmployees] = useState<EmployeeListDto[]>(
    []
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );
  const [selectedSchedule, setSelectedSchedule] =
    useState<EmployeeScheduleDto | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAll = async () => {
    try {
      setRefreshing(true);
      const [
        summaryRes,
        employeesRes,
        capacityRes,
        teamStatusRes,
        unassignedRes,
        scheduleEmployeesRes,
      ] = await Promise.all([
        fetchWorkloadSummary(),
        fetchEmployeeWorkloads(),
        fetchCapacityDistribution(),
        fetchTeamStatus(),
        fetchUnassignedTasks(),
        fetchScheduleEmployees(),
      ]);

      setSummary(summaryRes);
      setEmployees(employeesRes);
      setCapacityData(capacityRes);
      setTeamStatus(teamStatusRes);
      setUnassignedTasks(unassignedRes);
      setScheduleEmployees(scheduleEmployeesRes);

      // If no employee selected yet, pick first from schedule list
      if (!selectedEmployeeId && scheduleEmployeesRes.length > 0) {
        const firstId = scheduleEmployeesRes[0].id;
        setSelectedEmployeeId(firstId);
        const schedule = await fetchEmployeeSchedule(firstId, 7);
        setSelectedSchedule(schedule);
      } else if (selectedEmployeeId) {
        const schedule = await fetchEmployeeSchedule(selectedEmployeeId, 7);
        setSelectedSchedule(schedule);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectScheduleEmployee = async (id: number) => {
    setSelectedEmployeeId(id);
    const schedule = await fetchEmployeeSchedule(id, 7);
    setSelectedSchedule(schedule);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-6 w-56 bg-muted animate-pulse rounded-md" />
        <div className="h-40 bg-muted animate-pulse rounded-md" />
        <div className="h-64 bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Workload Monitoring
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor employee workload and optimize task distribution
          </p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={loadAll} disabled={refreshing}>
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-medium mb-3">Team Overview</h2>
        <WorkloadOverview
          employees={employees}
          summary={summary}
          selectedId={selectedEmployeeId}
          onSelect={handleSelectScheduleEmployee}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Capacity Analytics</h2>
        <CapacityChart data={capacityData} teamStatus={teamStatus} />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Task Management</h2>
        <TaskAssignment
          tasks={unassignedTasks}
          employees={scheduleEmployees}
          onChanged={loadAll}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium">Employee Schedules</h2>
        <EmployeeSchedule
          employees={scheduleEmployees}
          selectedEmployeeId={selectedEmployeeId}
          schedule={selectedSchedule}
          onSelectEmployee={handleSelectScheduleEmployee}
        />
      </section>
    </div>
  );
}
