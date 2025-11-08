'use client'

import type React from 'react'

import { AuthGuard } from '@/components/auth-guard'
import { CustomerSidebar } from '@/components/customer/customer-sidebar'
import { CustomerHeader } from '@/components/customer/customer-header'
import { NotificationProvider } from '@/components/real-time/notification-provider'
import { Toaster } from '@/components/ui/toaster'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['customer']}>
      <NotificationProvider>
        <div className="flex h-screen bg-background">
          <CustomerSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <CustomerHeader />
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>
        </div>
        <Toaster />
      </NotificationProvider>
    </AuthGuard>
  )
}
