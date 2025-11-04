"use client";
import React from "react";
import Link from "next/link";
import { Vehicle } from "@/types/vehicle";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="bg-gray-800 text-white p-4 rounded-xl shadow-md">
      <h2 className="text-lg font-bold">
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h2>
      <p>{vehicle.plateNumber} • {vehicle.color}</p>
      <p className="text-sm text-gray-400 mt-1">VIN: {vehicle.vin}</p>

      <div className="flex justify-between mt-3">
        <Link
          href={`/customer/vehicles/${vehicle.id}`}
          className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
