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

export function LiveNotifications() {
  const { notifications, unreadCount, markAsRead, clearAll } = useNotifications()

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

  return (
    <DropdownMenu>
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
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearAll}>
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
                      {notification.data.message ||
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
