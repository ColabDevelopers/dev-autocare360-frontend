"use client"
import React from 'react'
import { useParams, useRouter } from 'next/navigation'
import ServiceForm from '@/components/vehicle/ServiceForm'
import { useServices } from '@/hooks/useServices'

export default function NewServiceForVehiclePage() {
  const params = useParams()
  const vehicleId = params?.vehicleId as string
  const { createService } = useServices()
  const router = useRouter()

  const handleSubmit = async (payload: any) => {
    await createService({ ...payload, vehicleId })
    router.push(`/customer/vehicles/${vehicleId}`)
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Request Service</h1>
      <div className="mt-4">
        <ServiceForm initial={{ vehicleId }} onSubmit={handleSubmit} />
      </div>
    </div>
  )
}
