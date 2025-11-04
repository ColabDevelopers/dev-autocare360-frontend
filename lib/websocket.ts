'use client'

import { useEffect, useRef, useState } from 'react'

export interface WebSocketMessage {
  type: 'service_update' | 'appointment_update' | 'notification' | 'chat_message'
  data: any
  timestamp: string
  userId?: string
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState<WebSocketMessage[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const connect = () => {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws'
      
      console.log('[WebSocket] Connecting to:', wsUrl)

      try {
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
          console.log('[WebSocket] Connected successfully')
          setIsConnected(true)
        }

        ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data)
            console.log('[WebSocket] Message received:', message)
            setMessages(prev => [...prev, message])
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error)
          }
        }

        ws.onerror = (error) => {
          console.error('[WebSocket] Error:', error)
        }

        ws.onclose = () => {
          console.log('[WebSocket] Disconnected')
          setIsConnected(false)
          
          // Attempt to reconnect after 5 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('[WebSocket] Attempting to reconnect...')
            connect()
          }, 5000)
        }
      } catch (error) {
        console.error('[WebSocket] Connection failed:', error)
        // Retry connection
        reconnectTimeoutRef.current = setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      console.log('[WebSocket] Cleanup')
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const sendMessage = (message: Omit<WebSocketMessage, 'timestamp'>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const fullMessage: WebSocketMessage = {
        ...message,
        timestamp: new Date().toISOString(),
      }
      wsRef.current.send(JSON.stringify(fullMessage))
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
