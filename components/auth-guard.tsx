'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { userApi } from '@/lib/api'

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
      const token = localStorage.getItem('token')
      const userRole = localStorage.getItem('userRole')
      const userEmail = localStorage.getItem('userEmail')

      if (!token || !userRole || !userEmail) {
        router.push('/login')
        return
      }

      // Verify token with backend
      try {
        const response = await userApi.getCurrentUser()
        if (!response.data) {
          // Token invalid, clear storage and redirect
          localStorage.removeItem('token')
          localStorage.removeItem('userRole')
          localStorage.removeItem('userEmail')
          localStorage.removeItem('userName')
          localStorage.removeItem('userId')
          router.push('/login')
          return
        }

        // Update user info from backend
        const user = response.data as any
        localStorage.setItem('userEmail', user.email)
        localStorage.setItem('userName', user.name)
        localStorage.setItem('userRole', user.role.toLowerCase())

        if (!allowedRoles.includes(userRole)) {
          // Redirect to appropriate dashboard based on role
          if (userRole === 'admin') {
            router.push('/admin/dashboard')
          } else if (userRole === 'employee') {
            router.push('/employee/dashboard')
          } else {
            router.push('/customer/dashboard')
          }
          return
        }

        setIsAuthorized(true)
      } catch (error) {
        // Token invalid, clear storage and redirect
        localStorage.removeItem('token')
        localStorage.removeItem('userRole')
        localStorage.removeItem('userEmail')
        localStorage.removeItem('userName')
        localStorage.removeItem('userId')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
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
