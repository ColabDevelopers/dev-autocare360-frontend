"use client";
import React from "react";
import { Vehicle } from "@/types/vehicle";
import { Service } from "@/types/service";

interface Props {
  vehicle: Vehicle;
  services: Service[];
}

export default function VehicleDetail({ vehicle, services }: Props) {
  return (
    <div className="space-y-4">
      <div className="bg-[#111] p-4 rounded-lg">
        <h2 className="text-xl font-bold">{vehicle.make} {vehicle.model}</h2>
        <p>Year: {vehicle.year}</p>
        <p>Plate Number: {vehicle.plateNumber || "N/A"}</p>
        <p>Color: {vehicle.color || "N/A"}</p>
      </div>

      <div className="bg-[#111] p-4 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Services</h3>
        {services.length === 0 ? (
          <p>No services found</p>
        ) : (
          <ul className="space-y-1">
            {services.map((service) => (
              <li key={service.id} className="p-2 border-b border-[#2a2a2a]">
                {service.serviceName} - ${service.price} - {service.duration}h
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
