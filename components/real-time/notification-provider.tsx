'use client'

import type React from 'react'

import { createContext, useContext, useEffect, useState } from 'react'
import { useWebSocket, type WebSocketMessage } from '@/lib/websocket'
import { toast } from '@/hooks/use-toast'

interface NotificationContextType {
  notifications: WebSocketMessage[]
  unreadCount: number
  markAsRead: (id: string) => void
  clearAll: () => void
  refreshCount: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { messages, isConnected } = useWebSocket()
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [lastMarkAllReadTime, setLastMarkAllReadTime] = useState<number>(0)

  // Fetch unread notification count from backend
  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      // Don't fetch if user just marked all as read (within last 2 seconds)
      const timeSinceMarkAllRead = Date.now() - lastMarkAllReadTime
      if (timeSinceMarkAllRead < 2000) {
        console.log('[NotificationProvider] ⏭️ Skipping fetch - just marked all as read')
        return
      }

      const response = await fetch('http://localhost:8080/api/notifications/unread/count', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setUnreadCount(data.count || 0)
        console.log('[NotificationProvider] 📊 Unread count from backend:', data.count)
      }
    } catch (error) {
      console.error('[NotificationProvider] ❌ Error fetching unread count:', error)
    }
  }

  // Initial fetch of unread count
  useEffect(() => {
    fetchUnreadCount()
    
    // Refresh count every 30 seconds for offline updates
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    console.log('[NotificationProvider] WebSocket connected:', isConnected)
    console.log('[NotificationProvider] Messages received:', messages.length)

    // Filter messages for notifications
    const newNotifications = messages.filter(
      msg =>
        msg.type === 'service_update' ||
        msg.type === 'appointment_update' ||
        msg.type === 'notification'
    )

    if (newNotifications.length > notifications.length) {
      const latestNotification = newNotifications[newNotifications.length - 1]

      console.log('[NotificationProvider] 🔔 New notification:', latestNotification)

      // Fetch the actual count from backend instead of incrementing locally
      // This ensures we're always in sync with the database
      fetchUnreadCount()
    }

    setNotifications(newNotifications)
  }, [messages, notifications.length])

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'service_update':
        return 'Service Update'
      case 'appointment_update':
        return 'Appointment Update'
      case 'notification':
        return 'New Notification'
      default:
        return 'Update'
    }
  }

  const getNotificationDescription = (notification: WebSocketMessage) => {
    switch (notification.type) {
      case 'service_update':
        return `Service #${notification.data.serviceId} status updated to ${notification.data.status}`
      case 'appointment_update':
        return `Appointment scheduled for ${notification.data.date}`
      default:
        return notification.data.message || 'You have a new update'
    }
  }

  const markAsRead = (id: string) => {
    console.log('[NotificationProvider] Marking notification as read:', id)
    // Don't decrement here - let the backend API handle it
  }

  const clearAll = () => {
    console.log('[NotificationProvider] Clearing all notifications')
    setNotifications([])
    setUnreadCount(0)
    setLastMarkAllReadTime(Date.now())
  }

  const refreshCount = () => {
    console.log('[NotificationProvider] Refreshing notification count')
    setLastMarkAllReadTime(Date.now())
    fetchUnreadCount()
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearAll,
        refreshCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
