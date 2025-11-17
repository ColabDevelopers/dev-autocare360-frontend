import { useState, useEffect } from 'react'
import * as appointmentsApi from '@/services/appointments'
import { Appointment, AppointmentStats } from '@/services/appointments'

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<AppointmentStats | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await appointmentsApi.getMyAppointments()
      setAppointments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments')
      console.error('Error fetching appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUpcomingAppointments = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await appointmentsApi.getUpcomingAppointments()
      setUpcomingAppointments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming appointments')
      console.error('Error fetching upcoming appointments:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const data = await appointmentsApi.getAppointmentStats()
      setStats(data)
    } catch (err) {
      console.error('Error fetching appointment stats:', err)
      // Don't set error state for stats as it's optional
    }
  }

  const createAppointment = async (payload: {
    vehicleId: string
    serviceType: string
    date: string
    time: string
    notes?: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      const newAppointment = await appointmentsApi.createAppointment(payload)
      await fetchAppointments()
      await fetchUpcomingAppointments()
      await fetchStats()
      return newAppointment
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment')
      console.error('Error creating appointment:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (id: string | number) => {
    setLoading(true)
    setError(null)
    try {
      await appointmentsApi.cancelAppointment(id)
      await fetchAppointments()
      await fetchUpcomingAppointments()
      await fetchStats()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment')
      console.error('Error canceling appointment:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
    fetchUpcomingAppointments()
    fetchStats()
  }, [])

  return {
    appointments,
    upcomingAppointments,
    stats,
    loading,
    error,
    refresh: fetchAppointments,
    createAppointment,
    cancelAppointment,
  }
}
