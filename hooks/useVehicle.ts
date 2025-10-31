"use client"
import { useEffect, useState } from 'react'
import { Vehicle } from '../types/vehicle'
import { Service } from '../types/service'
import * as vehiclesApi from '../lib/vehicles'
import * as servicesApi from '../lib/services'

export function useVehicle(id?: string) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let mounted = true
    const load = async () => {
      setLoading(true)
      try {
        const v = await vehiclesApi.getVehicle(id)
        const s = await servicesApi.getVehicleServices(id)
        if (!mounted) return
        setVehicle(v)
        setServices(s || [])
      } catch (err: any) {
        setError(err?.message || 'Failed to load vehicle')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [id])

  return { vehicle, services, loading, error }
}
