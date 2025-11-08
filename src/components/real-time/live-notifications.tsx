'use client'

import { Bell, X, CheckCircle, AlertTriangle, Info, Car } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useNotifications } from './notification-provider'
import { useState } from 'react'

export function LiveNotifications() {
  const { notifications, unreadCount, markAsRead, clearAll, refreshCount } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)
  const [isMarking, setIsMarking] = useState(false)

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'service_update':
        return <Car className="h-4 w-4 text-blue-500" />
      case 'appointment_update':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'notification':
        return <Info className="h-4 w-4 text-purple-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  // Mark all notifications as read when dropdown opens
  const handleOpenChange = async (open: boolean) => {
    setIsOpen(open)

    if (open && unreadCount > 0 && !isMarking) {
      setIsMarking(true)
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          setIsMarking(false)
          return
        }

        // Call backend API to mark all as read
        const response = await fetch('http://localhost:8080/api/notifications/read-all', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          console.log('[LiveNotifications] ✅ All notifications marked as read')
          // Wait a moment before refreshing to ensure backend has processed
          setTimeout(() => {
            refreshCount()
            setIsMarking(false)
          }, 500)
        } else {
          setIsMarking(false)
        }
      } catch (error) {
        console.error('[LiveNotifications] ❌ Error marking notifications as read:', error)
        setIsMarking(false)
      }
    }
  }

  const handleClearAll = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return

      // Mark all as read in backend
      await fetch('http://localhost:8080/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      // Clear local state
      clearAll()
      console.log('[LiveNotifications] ✅ All notifications cleared')
    } catch (error) {
      console.error('[LiveNotifications] ❌ Error clearing notifications:', error)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll}>
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications
              .slice(-10)
              .reverse()
              .map((notification, index) => (
                <DropdownMenuItem
                  key={`${notification.timestamp}-${index}`}
                  className="flex items-start space-x-3 p-3 cursor-pointer"
                  onClick={() => markAsRead(notification.timestamp)}
                >
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">
                      {notification.type === 'service_update' && 'Service Update'}
                      {notification.type === 'appointment_update' && 'Appointment Update'}
                      {notification.type === 'notification' && 'System Notification'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.data.notificationMessage ||
                        notification.data.message ||
                        `Service #${notification.data.serviceId} updated` ||
                        'New update available'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
