"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getVehicle } from "@/lib/vehicles";
import VehicleDetail from "@/components/vehicle/VehicleDetail";

export default function VehicleDetailPage() {
  const { vehicleId } = useParams();
  const [vehicle, setVehicle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vehicleId) return;

    const fetchVehicle = async () => {
      try {
        const data = await getVehicle(vehicleId as string);
        setVehicle(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [vehicleId]);

  if (loading) return <div className="p-6">Loading vehicle details...</div>;
  if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
  if (!vehicle) return <div className="p-6">Vehicle not found.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Vehicle Details</h1>
      <VehicleDetail vehicle={vehicle} services={[]} />
    </div>
  );
}
