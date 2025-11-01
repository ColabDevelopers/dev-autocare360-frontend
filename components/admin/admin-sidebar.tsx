'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Users,
  Car,
  Calendar,
  ClipboardList,
  BarChart3,
  Settings,
  ChevronLeft,
  Shield,
  UserCheck,
  FileText,
  LogOut,
  Activity, // ⭐ NEW IMPORT FOR WORKLOAD
} from 'lucide-react'
import { clearToken } from '@/lib/auth'

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'User Management', icon: Users },
  { href: '/admin/employees', label: 'Employee Management', icon: UserCheck },
  { href: '/admin/workload', label: 'Workload Monitoring', icon: Activity }, // ⭐ NEW LINE ADDED
  { href: '/admin/services', label: 'Service Management', icon: Car },
  { href: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { href: '/admin/projects', label: 'Projects', icon: ClipboardList },
  { href: '/admin/reports', label: 'Reports & Analytics', icon: BarChart3 },
  { href: '/admin/approvals', label: 'Approvals', icon: Shield },
  { href: '/admin/audit', label: 'Audit Logs', icon: FileText },
  { href: '/admin/settings', label: 'System Settings', icon: Settings },
]

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div
      className={cn(
        'bg-card border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Admin Panel</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft
              className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
            />
          </Button>
        </div>
      </div>

      <nav className="p-2">
        {adminNavItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={cn('w-full justify-start mb-1 h-10', collapsed && 'px-2')}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!collapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 mt-auto">
        <Button
          variant="ghost"
          className={cn('w-full justify-start h-10', collapsed && 'px-2')}
          onClick={() => {
            clearToken()
            router.push('/login')
          }}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
  )
}