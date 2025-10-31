"use client"
import React from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useVehicle } from '@/hooks/useVehicle'
import VehicleDetail from '@/components/vehicle/VehicleDetail'

export default function VehicleDetailPage() {
  const params = useParams()
  const id = params?.vehicleId as string | undefined
  const { vehicle, services, loading } = useVehicle(id)

  if (loading) return <div>Loading...</div>
  if (!vehicle) return <div>Vehicle not found</div>

  return (
    <div className="p-4">
      <VehicleDetail vehicle={vehicle} services={services} />
    </div>
  )
}
