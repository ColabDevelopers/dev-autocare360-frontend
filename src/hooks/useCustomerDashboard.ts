import { useState, useEffect } from 'react'
import {
  getDashboardStats,
  getActiveServices,
  getUpcomingAppointments,
  getNextService,
  getRecentNotifications,
  searchDashboard,
  type DashboardStats,
  type ActiveService,
  type UpcomingAppointment,
  type NextService,
  type RecentNotification,
} from '@/services/customerDashboard'

export function useCustomerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activeServices, setActiveServices] = useState<ActiveService[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<UpcomingAppointment[]>([])
  const [nextService, setNextService] = useState<NextService | null>(null)
  const [recentNotifications, setRecentNotifications] = useState<RecentNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchResults, setSearchResults] = useState<{
    services: ActiveService[]
    appointments: UpcomingAppointment[]
    vehicles: any[]
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const [statsData, activeServicesData, appointmentsData, nextServiceData, notificationsData] =
        await Promise.all([
          getDashboardStats().catch((err) => {
            console.error('Stats fetch error:', err)
            return null
          }),
          getActiveServices(),
          getUpcomingAppointments(),
          getNextService(),
          getRecentNotifications(),
        ])

      setStats(statsData)
      setActiveServices(activeServicesData)
      setUpcomingAppointments(appointmentsData)
      setNextService(nextServiceData)
      setRecentNotifications(notificationsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data')
      console.error('Dashboard data fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const search = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null)
      return
    }

    try {
      setIsSearching(true)
      const results = await searchDashboard(query)
      setSearchResults(results)
    } catch (err) {
      console.error('Search error:', err)
      setSearchResults({ services: [], appointments: [], vehicles: [] })
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchResults(null)
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    stats,
    activeServices,
    upcomingAppointments,
    nextService,
    recentNotifications,
    isLoading,
    error,
    searchResults,
    isSearching,
    search,
    clearSearch,
    refresh: fetchDashboardData,
  }
}
