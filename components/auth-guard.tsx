'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { loadToken } from '@/lib/auth'
import { me } from '@/services/auth'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  allowedRoles: string[]
}

export function AuthGuard({ children, allowedRoles }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = loadToken()
        if (!token) {
          router.push('/login')
          return
        }
        const user = await me()
        const userRole = (user?.roles?.[0] || '').toLowerCase()
        if (!allowedRoles.includes(userRole)) {
          if (userRole === 'admin') router.push('/admin/dashboard')
          else if (userRole === 'employee') router.push('/employee/dashboard')
          else router.push('/customer/dashboard')
          return
        }
        setIsAuthorized(true)
      } catch (e) {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    void checkAuth()
  }, [allowedRoles, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthorized) {
    return null
  }

  return <>{children}</>
}
