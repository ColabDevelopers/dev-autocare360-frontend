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
        console.log('AuthGuard: Token check', { exists: !!token, length: token?.length })

        if (!token) {
          console.log('AuthGuard: No token, redirecting to login')
          router.push('/login')
          return
        }

        console.log('AuthGuard: Fetching user info...')
        const user = await me()
        console.log('AuthGuard: User data received', { user, roles: user?.roles })

        // Backend returns roles as lowercase strings in array: ["customer", "admin", "employee"]
        const userRole = (user?.roles?.[0] || '').toLowerCase()
        console.log('AuthGuard: User role', { userRole, allowedRoles })

        if (!allowedRoles.includes(userRole)) {
          console.log('AuthGuard: Role not allowed, redirecting based on role')
          if (userRole === 'admin') router.push('/admin/dashboard')
          else if (userRole === 'employee') router.push('/employee/dashboard')
          else if (userRole === 'customer') router.push('/customer/dashboard')
          else router.push('/login')
          return
        }

        console.log('AuthGuard: Authorization successful')
        setIsAuthorized(true)
      } catch (e) {
        console.error('AuthGuard: Error during auth check', e)
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
