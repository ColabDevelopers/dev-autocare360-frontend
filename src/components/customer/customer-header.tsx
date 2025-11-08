'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Search, MessageCircle, Settings, User } from 'lucide-react'
import { LiveNotifications } from '@/components/real-time/live-notifications'
import { useUnreadCount } from '@/hooks/use-unread-count'
import { me } from '@/services/auth'
import { useRouter } from 'next/navigation'

export function CustomerHeader() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const { count: unreadCount } = useUnreadCount(30000)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const u = await me()
        if (!mounted) return
        setUserEmail(u?.email || '')
        setUserName(u?.name || '')
      } catch {
        // ignore, header remains minimal
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const getInitials = (name: string, email: string) => {
    if (name) {
      const parts = name.trim().split(' ')
      return (
        parts
          .slice(0, 2)
          .map(p => p[0]?.toUpperCase())
          .join('') || 'U'
      )
    }
    return (email.split('@')[0] || 'U').slice(0, 2).toUpperCase()
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-foreground">Customer Dashboard</h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search services, appointments..."
              className="pl-10 w-64 bg-background border-border"
            />
          </div>

          <LiveNotifications />

          {/* Messages */}
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => router.push('/customer/messages')}
          >
            <MessageCircle className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground">
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(userName, userEmail)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Customer Account</p>
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push('/customer/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push('/customer/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
