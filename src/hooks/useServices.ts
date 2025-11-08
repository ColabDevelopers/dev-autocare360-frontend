import { useState, useEffect } from 'react'
import * as serviceAPI from '@/lib/services'
import { Service, CreateServicePayload } from '@/types/service'

interface ServiceStats {
  totalServices: number
  activeServices: number
  averagePrice: number
  averageDuration: number
}

export function useServices(vehicleId?: string) {
  const [services, setServices] = useState<Service[]>([])
  const [stats, setStats] = useState<ServiceStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Map backend DTO to frontend Service type
  const mapServiceRecordDTO = (dto: any): Service => ({
    id: dto.id,
    vehicleId: dto.vehicleId,
    serviceName: dto.name ?? '-',
    category: dto.type ?? '-',
    status: dto.status ?? '-',
    description: dto.notes ?? '-',
    attachments: Array.isArray(dto.attachments) ? dto.attachments : [],
    requestedAt: dto.requestedAt ? new Date(dto.requestedAt).toISOString() : undefined,
    scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt).toISOString() : undefined,
    price: dto.price ?? 0,
    duration: dto.duration ?? 0,
  })

  // Calculate stats
  const calculateStats = (serviceList: Service[]): ServiceStats => {
    const activeServices = serviceList.filter(s => s.status === 'active').length
    const totalPrice = serviceList.reduce((sum, s) => sum + (s.price || 0), 0)
    const totalDuration = serviceList.reduce((sum, s) => sum + (s.duration || 0), 0)
    return {
      totalServices: serviceList.length,
      activeServices,
      averagePrice: serviceList.length > 0 ? totalPrice / serviceList.length : 0,
      averageDuration: serviceList.length > 0 ? totalDuration / serviceList.length : 0,
    }
  }

  // Fetch services
  const fetchServices = async (params?: Record<string, any>) => {
    setLoading(true)
    setError(null)
    try {
      let serviceList: Service[]

      if (vehicleId) {
        const data = await serviceAPI.getVehicleServices(vehicleId, params)
        serviceList = data.map(mapServiceRecordDTO)
      } else {
        const data = await serviceAPI.getServices(params)
        serviceList = (data.items || []).map(mapServiceRecordDTO)
      }

      setServices(serviceList)
      setStats(calculateStats(serviceList))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  // Fetch summary
  const fetchSummary = async () => {
    setLoading(true)
    setError(null)
    try {
      const summary = await serviceAPI.getServiceSummary()
      setStats({
        totalServices: summary.totalServices,
        activeServices: services.filter(s => s.status === 'active').length,
        averagePrice: summary.averagePrice,
        averageDuration: summary.averageDuration,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service summary')
      console.error('Error fetching service summary:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create service
  const createService = async (payload: CreateServicePayload) => {
    setLoading(true)
    setError(null)
    try {
      const newService = await serviceAPI.createService(payload)
      await fetchServices()
      return mapServiceRecordDTO(newService)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service')
      console.error('Error creating service:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update service
  const updateService = async (id: string, payload: Partial<CreateServicePayload>) => {
    setLoading(true)
    setError(null)
    try {
      const updated = await serviceAPI.updateService(id, payload)
      await fetchServices()
      return mapServiceRecordDTO(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service')
      console.error('Error updating service:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Delete service
  const deleteService = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      await serviceAPI.deleteService(id)
      await fetchServices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service')
      console.error('Error deleting service:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [vehicleId])

  useEffect(() => {
    fetchSummary()
  }, [services])

  return {
    services,
    stats,
    loading,
    error,
    refresh: fetchServices,
    createService,
    updateService,
    deleteService,
  }
}
