'use client'

import { useEffect, useRef, useState } from 'react'
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export interface WebSocketMessage {
  type: 'service_update' | 'appointment_update' | 'notification' | 'chat_message'
  data: any
  timestamp: string
  userId?: string
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const clientRef = useRef<Client | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const connect = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      
      console.log('[WebSocket] Connecting to:', apiUrl + '/ws')

      const client = new Client({
        webSocketFactory: () => new SockJS(apiUrl + '/ws'),
        debug: (str) => {
          console.log('[STOMP Debug]', str)
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      })

      client.onConnect = () => {
        console.log('[WebSocket] Connected successfully')
        setIsConnected(true)

        // Subscribe to service updates topic
        client.subscribe('/topic/service-updates', (message: IMessage) => {
          try {
            const parsed = JSON.parse(message.body)
            console.log('[WebSocket] Service update received:', parsed)
            setMessages(prev => [...prev, parsed])
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error)
          }
        })

        console.log('[WebSocket] Subscribed to /topic/service-updates')
      }

      client.onStompError = (frame) => {
        console.error('[WebSocket] STOMP error:', frame)
      }

      client.onWebSocketClose = () => {
        console.log('[WebSocket] Disconnected')
        setIsConnected(false)
      }

      client.activate()
      clientRef.current = client
    }

    connect()

    return () => {
      console.log('[WebSocket] Cleanup')
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (clientRef.current) {
        clientRef.current.deactivate()
      }
    }
  }, [])

  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (clientRef.current && clientRef.current.connected) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
      }
      clientRef.current.publish({
        destination: '/app/message',
        body: JSON.stringify(fullMessage),
      })
      console.log('[WebSocket] Message sent:', fullMessage)
    } else {
      console.warn('[WebSocket] Cannot send message - not connected')
    }
  }

  return {
    isConnected,
    messages,
    sendMessage,
    clearMessages: () => setMessages([]),
  }
}
