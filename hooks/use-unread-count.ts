"use client"

import { useCallback, useEffect, useRef, useState } from 'react'

export function useUnreadCount(pollMs: number = 30000) {
  const [count, setCount] = useState<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchCount = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
      if (!token) {
        setCount(0)
        return
      }
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const res = await fetch(`${apiUrl}/api/messages/unread/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      })
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }
      const value = await res.json()
      // Ensure numeric
      const n = typeof value === 'number' ? value : Number(value)
      setCount(Number.isFinite(n) ? n : 0)
    } catch (e) {
      // Fail quietly; keep last count
      // console.warn('Unread count fetch failed', e)
    }
  }, [])

  const refresh = useCallback(() => {
    fetchCount()
  }, [fetchCount])

  useEffect(() => {
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
