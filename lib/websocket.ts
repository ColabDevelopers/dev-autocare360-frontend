'use client'

import { useEffect, useRef, useState } from 'react'

export interface WebSocketMessage {
  type: 'service_update' | 'appointment_update' | 'notification' | 'chat_message'
  data: any
  timestamp: string
  userId?: string
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(true) // Always connected in mock mode
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const mockIntervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    console.log('[v0] Mock WebSocket initializing - NO real WebSocket connection')
    setIsConnected(true)

    const initialMessages: WebSocketMessage[] = [
      {
        type: 'notification',
        data: { message: 'Mock notification system active - no WebSocket server needed' },
        timestamp: new Date().toISOString(),
        userId: 'user-123',
      },
    ]

    setMessages(initialMessages)

    mockIntervalRef.current = setInterval(() => {
      const mockMessages: WebSocketMessage[] = [
        {
          type: 'service_update',
          data: { serviceId: 'SRV-001', status: 'In Progress' },
          timestamp: new Date().toISOString(),
          userId: 'user-123',
        },
        {
          type: 'appointment_update',
          data: { appointmentId: 'APT-001', date: '2024-01-15', status: 'Confirmed' },
          timestamp: new Date().toISOString(),
          userId: 'user-123',
        },
        {
          type: 'notification',
          data: { message: 'Your vehicle service is ready for pickup' },
          timestamp: new Date().toISOString(),
          userId: 'user-123',
        },
      ]

      // Send a mock message every 2 minutes with lower probability
      if (Math.random() > 0.9) {
        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)]
        console.log('[v0] Mock WebSocket sending message:', randomMessage)
        setMessages(prev => [...prev, randomMessage])
      }
    }, 120000) // 2 minutes

    return () => {
      console.log('[v0] Mock WebSocket cleanup')
      if (mockIntervalRef.current) {
        clearInterval(mockIntervalRef.current)
      }
    }
  }, [])

  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    const fullMessage: WebSocketMessage = {
      ...message,
      timestamp: new Date().toISOString(),
    }
    console.log('[v0] Mock WebSocket message sent:', fullMessage)
    setMessages(prev => [...prev, fullMessage])
  }

  return {
    isConnected,
    messages,
    sendMessage,
    clearMessages: () => setMessages([]),
  }
}
