"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useWebSocket, type WebSocketMessage } from "@/lib/websocket"
import { toast } from "@/hooks/use-toast"

interface NotificationContextType {
  notifications: WebSocketMessage[]
  unreadCount: number
  markAsRead: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { messages, isConnected } = useWebSocket()
  const [notifications, setNotifications] = useState<WebSocketMessage[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    console.log("[v0] NotificationProvider - WebSocket connected:", isConnected)
    console.log("[v0] NotificationProvider - Messages received:", messages.length)

    // Filter messages for notifications
    const newNotifications = messages.filter(
      (msg) => msg.type === "service_update" || msg.type === "appointment_update" || msg.type === "notification",
    )

    if (newNotifications.length > notifications.length) {
      const latestNotification = newNotifications[newNotifications.length - 1]

      console.log("[v0] NotificationProvider - New notification:", latestNotification)

      // Show toast for new notifications
      toast({
        title: getNotificationTitle(latestNotification.type),
        description: getNotificationDescription(latestNotification),
      })
    }

    setNotifications(newNotifications)
    setUnreadCount(newNotifications.length)
  }, [messages, notifications.length])

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "service_update":
        return "Service Update"
      case "appointment_update":
        return "Appointment Update"
      case "notification":
        return "New Notification"
      default:
        return "Update"
    }
  }

  const getNotificationDescription = (notification: WebSocketMessage) => {
    switch (notification.type) {
      case "service_update":
        return `Service #${notification.data.serviceId} status updated to ${notification.data.status}`
      case "appointment_update":
        return `Appointment scheduled for ${notification.data.date}`
      default:
        return notification.data.message || "You have a new update"
    }
  }

  const markAsRead = (id: string) => {
    console.log("[v0] NotificationProvider - Marking notification as read:", id)
    // Implementation for marking specific notification as read
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const clearAll = () => {
    console.log("[v0] NotificationProvider - Clearing all notifications")
    setNotifications([])
    setUnreadCount(0)
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
