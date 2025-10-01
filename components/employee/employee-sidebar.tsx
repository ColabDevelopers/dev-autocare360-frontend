'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Wrench,
  BarChart3,
  MessageCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Upload,
  Users,
  Car,
} from 'lucide-react'

const navigationItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/employee/dashboard' },
  { icon: Calendar, label: 'Appointments', href: '/employee/appointments' },
  { icon: Wrench, label: 'Projects', href: '/employee/projects' },
  { icon: Clock, label: 'Time Logs', href: '/employee/time-logs' },
  { icon: Upload, label: 'Updates', href: '/employee/updates' },
  { icon: MessageCircle, label: 'Messages', href: '/employee/messages', badge: '5' },
  { icon: Users, label: 'Workload', href: '/employee/workload' },
]

export function EmployeeSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    localStorage.removeItem('userRole')
    localStorage.removeItem('userEmail')
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
                    {item.badge && (
                      <Badge
                        variant="secondary"
                        className="ml-auto bg-primary text-primary-foreground"
                      >
                        {item.badge}
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
              console.log('[v0] Employee notifications clicked')
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
