"use client";
import { useEffect, useState } from "react";
import { Vehicle } from "@/types/vehicle";
import * as vehiclesApi from "@/lib/vehicles";

export function useVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const data = await vehiclesApi.listVehicles();
        const list = Array.isArray(data)
          ? data
          : (data as { items?: Vehicle[] }).items || [];

        if (mounted) setVehicles(list);
      } catch (err: any) {
        console.error("Error loading vehicles", err);
        setError(err?.message || "Failed to load vehicles");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { vehicles, loading, error, setVehicles };
}
