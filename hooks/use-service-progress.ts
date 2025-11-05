'use client'

import { useEffect, useState } from 'react'
import { useWebSocket, type WebSocketMessage } from '@/lib/websocket'

interface ServiceProgressUpdate {
  serviceId: number
  status: string
  progress: number
  vehicle?: string
  service?: string
  notificationTitle?: string
  notificationMessage?: string
}

export function useServiceProgress() {
  const { messages, isConnected } = useWebSocket()
  const [latestUpdate, setLatestUpdate] = useState<ServiceProgressUpdate | null>(null)

  useEffect(() => {
    if (messages.length === 0) return

    const latestMessage = messages[messages.length - 1]
    
    console.log('[useServiceProgress] Raw message:', latestMessage)

    // Handle the message - it should already be parsed by websocket.ts
    if (latestMessage.type === 'service_update' && latestMessage.data) {
      console.log('[useServiceProgress] Processing service update:', latestMessage.data)

      setLatestUpdate({
        serviceId: latestMessage.data.serviceId,
        status: latestMessage.data.status,
        progress: latestMessage.data.progress,
        vehicle: latestMessage.data.vehicle,
        service: latestMessage.data.service,
        notificationTitle: latestMessage.data.notificationTitle,
        notificationMessage: latestMessage.data.notificationMessage,
      })
    }
  }, [messages])

  return {
    latestUpdate,
    isConnected,
  }
}
