"use client"; // needed if using hooks like useState/useEffect

import React from "react";
import VehiclesList from "@/components/vehicle/VehiclesList";

export default function CustomerVehiclesPage() {
  return (
    <div className="p-4">
      <VehiclesList />
    </div>
  );
}
