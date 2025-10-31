"use client"
import { useEffect, useState, useCallback } from 'react'
import { Vehicle, CreateVehiclePayload, UpdateVehiclePayload } from '../types/vehicle'
import * as vehiclesApi from '../lib/vehicles'

export function useVehicles(initialPage = 1, perPage = 10) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async (page = initialPage) => {
    setLoading(true)
    setError(null)
    try {
      const res = await vehiclesApi.getVehicles({ page, perPage })
      setVehicles(res.items || [])
      setTotal(res.total || 0)
    } catch (err: any) {
      setError(err?.message || 'Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }, [initialPage, perPage])

  useEffect(() => { fetch(initialPage) }, [fetch, initialPage])

  const createVehicle = async (payload: CreateVehiclePayload) => {
    const created = await vehiclesApi.createVehicle(payload)
    setVehicles(prev => [created, ...prev])
    return created
  }

  const updateVehicle = async (id: string, payload: UpdateVehiclePayload) => {
    const updated = await vehiclesApi.updateVehicle(id, payload)
    setVehicles(prev => prev.map(v => (v.id === id ? updated : v)))
    return updated
  }

  const deleteVehicle = async (id: string) => {
    await vehiclesApi.deleteVehicle(id)
    setVehicles(prev => prev.filter(v => v.id !== id))
  }

  return { vehicles, total, loading, error, refresh: fetch, createVehicle, updateVehicle, deleteVehicle }
}
