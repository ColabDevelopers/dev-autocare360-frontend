"use client"
import React from 'react'
import VehicleForm from '@/components/vehicle/VehicleForm'
import { useRouter } from 'next/navigation'
import { useVehicles } from '@/hooks/useVehicles'

export default function NewVehiclePage() {
  const router = useRouter()
  const { createVehicle } = useVehicles()

  const handleSubmit = async (payload: any) => {
    await createVehicle(payload)
    router.push('/customer/vehicles')
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Register New Vehicle</h1>
      <div className="mt-4">
        <VehicleForm onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
