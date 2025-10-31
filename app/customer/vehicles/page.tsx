"use client"; // needed if using hooks like useState/useEffect

import React from "react";
import { useVehicles } from "@/hooks/useVehicles";
import VehiclesList from "@/components/vehicle/VehiclesList";

export default function CustomerVehiclesPage() {
  const { vehicles, loading } = useVehicles();

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <VehiclesList />
    </div>
  );
}
