'use client'

import type React from 'react'

import { AuthGuard } from '@/components/auth-guard'
import { EmployeeSidebar } from '@/components/employee/employee-sidebar'
import { EmployeeHeader } from '@/components/employee/employee-header'
import { AIChatbot } from '@/components/ai-chatbot/chatbot'

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['employee']}>
      <div className="flex h-screen bg-background">
        <EmployeeSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <EmployeeHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
        <AIChatbot />
      </div>
    </AuthGuard>
  )
}
