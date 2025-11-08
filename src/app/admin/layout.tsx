import type React from 'react'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'
import { AIChatbot } from '@/components/ai-chatbot/chatbot'
import { AuthGuard } from '@/components/auth-guard'
import { Toaster } from 'react-hot-toast'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
        <AIChatbot />
      </div>
      <Toaster position="top-right" reverseOrder={false} />
    </AuthGuard>
  )
}
