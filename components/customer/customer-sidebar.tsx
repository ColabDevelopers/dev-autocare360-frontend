'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { clearToken } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Car,
  Calendar,
  Settings,
  User,
  Wrench,
  BarChart3,
  MessageCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Bot,
} from 'lucide-react'
import { useUnreadCount } from '@/hooks/use-unread-count'

const navigationItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/customer/dashboard' },
  { icon: User, label: 'Profile', href: '/customer/profile' },
  { icon: Car, label: 'Vehicles', href: '/customer/vehicles' },
  { icon: Calendar, label: 'Appointments', href: '/customer/appointments' },
  { icon: Wrench, label: 'Projects', href: '/customer/projects' },
  { icon: Settings, label: 'Progress', href: '/customer/progress' },
  { icon: Bot, label: 'AI Assistant', href: '/customer/chat' },
  { icon: MessageCircle, label: 'Messages', href: '/customer/messages' },
]

export function CustomerSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { count: unreadCount } = useUnreadCount(30000)

  const handleLogout = () => {
    clearToken()
    router.push('/login')
  }

  return (
    <div
      className={`bg-sidebar border-r border-sidebar-border transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Car className="h-6 w-6 text-sidebar-primary" />
                  <Wrench className="h-3 w-3 text-accent absolute -bottom-0.5 -right-0.5" />
                </div>
                <span className="font-semibold text-sidebar-foreground">AutoCare360</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-sidebar-foreground hover:bg-sidebar-accent"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
                  isActive ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''
                } ${isCollapsed ? 'px-2' : 'px-3'}`}
                onClick={() => router.push(item.href)}
              >
                <item.icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.href === '/customer/messages' && unreadCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-auto bg-primary text-primary-foreground"
                      >
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Badge>
                    )}
                  </>
                )}
              </Button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <Button
            variant="ghost"
            className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
            onClick={() => {
              console.log('[v0] Notifications clicked')
              // TODO: Implement notifications functionality
            }}
          >
            <Bell className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && 'Notifications'}
          </Button>
          <Button
            variant="ghost"
            className={`w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent ${
              isCollapsed ? 'px-2' : 'px-3'
            }`}
            onClick={handleLogout}
          >
            <LogOut className={`h-4 w-4 ${isCollapsed ? '' : 'mr-3'}`} />
            {!isCollapsed && 'Sign Out'}
          </Button>
        </div>
      </div>
    </div>
  )
}
