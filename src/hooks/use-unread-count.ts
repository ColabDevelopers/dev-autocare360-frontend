"use client"

import { useCallback, useEffect, useRef, useState } from 'react'

export function useUnreadCount(pollMs: number = 30000) {
  const [count, setCount] = useState<number>(0)
  const [role, setRole] = useState<'EMPLOYEE' | 'CUSTOMER' | 'OTHER'>('OTHER')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchCount = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      if (!token) {
        setCount(0)
        return
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      if (role === 'EMPLOYEE') {
        // Sum unread per-conversation for employees to account for customer broadcasts
        const res = await fetch(`${apiUrl}/api/messages/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const conversations = await res.json()
        const total = Array.isArray(conversations)
          ? conversations.reduce((acc: number, c: any) => acc + (Number(c?.unreadCount) || 0), 0)
          : 0
        setCount(total)
      } else {
        // Customers (and others) can rely on the simple unread count endpoint
        const res = await fetch(`${apiUrl}/api/messages/unread/count`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const value = await res.json()
        const n = typeof value === 'number' ? value : Number(value)
        setCount(Number.isFinite(n) ? n : 0)
      }
    } catch (e) {
      // Fail quietly; keep last count
      // console.warn('Unread count fetch failed', e)
    }
  }, [role])

  const refresh = useCallback(() => {
    fetchCount()
  }, [fetchCount])

  useEffect(() => {
    // Identify role once (used to select counting strategy)
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
        if (!token) return
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        const res = await fetch(`${apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        // Try a few shapes to detect role
        const roles: any[] = data?.roles || data?.user?.roles || []
        const roleNames = roles.map((r: any) => typeof r === 'string' ? r : (r?.name || '')).map((s: string) => s.toUpperCase())
        if (roleNames.includes('EMPLOYEE')) setRole('EMPLOYEE')
        else if (roleNames.includes('CUSTOMER')) setRole('CUSTOMER')
        else setRole('OTHER')
      } catch {
        // ignore
      }
    })()

    // Initial fetch
    fetchCount()

    // Polling
    if (pollMs > 0) {
      timerRef.current = setInterval(fetchCount, pollMs)
    }

    // Refresh on visibility change or window focus
    const onFocus = () => fetchCount()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') fetchCount()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)

    // Refresh on custom global event (trigger from pages/hooks after read/new msg)
  const onCustomRefresh = () => fetchCount()
    window.addEventListener('unread:refresh', onCustomRefresh as EventListener)

    // Token changed
    const onStorage = (ev: StorageEvent) => {
      if (ev.key === 'accessToken') fetchCount()
    }
    window.addEventListener('storage', onStorage)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('unread:refresh', onCustomRefresh as EventListener)
      window.removeEventListener('storage', onStorage)
    }
  }, [fetchCount, pollMs])

  return { count, refresh }
}
