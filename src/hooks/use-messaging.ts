import { useEffect, useRef, useState, useCallback } from 'react'
import SockJS from 'sockjs-client'
import { Client, IMessage, StompSubscription, IFrame } from '@stomp/stompjs'

interface Message {
  id: number
  senderId: number
  receiverId: number
  senderName: string
  senderRole: string
  message: string
  createdAt: string
  isRead: boolean
}

interface UseMessagingReturn {
  connected: boolean
  sendMessage: (receiverId: number, message: string) => Promise<void>
  messages: Message[]
  subscribe: () => void
  unsubscribe: () => void
}

export function useMessaging(userId: number): UseMessagingReturn {
  const [connected, setConnected] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const clientRef = useRef<Client | null>(null)
  const subscriptionRef = useRef<StompSubscription | null>(null)
  const employeeSubscriptionRef = useRef<StompSubscription | null>(null)  // For employee broadcast

  const connect = useCallback(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const token = localStorage.getItem('accessToken')
    
    if (!token) {
      console.warn('⚠️ No access token found - cannot connect to WebSocket')
      return
    }
    
    console.log('🔌 Attempting WebSocket connection to:', `${apiUrl}/ws`)
    
    const socket = new SockJS(`${apiUrl}/ws`)
    const client = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: {
        // Send JWT token in CONNECT frame headers for authentication
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str: string) => {
        console.log('STOMP Debug:', str)
      },
      onConnect: () => {
        console.log('✅ WebSocket Connected with authentication')
        setConnected(true)

        // Auto-subscribe on successful connect (idempotent)
        if (!subscriptionRef.current) {
          subscriptionRef.current = client.subscribe(
            `/user/queue/messages`,
            (message: IMessage) => {
              const newMessage = JSON.parse(message.body) as Message
              console.log('✅ [auto] DIRECT /user/queue/messages:', newMessage)
              setMessages((prev) => [...prev, newMessage])
              // Direct messages to this user likely change unread count
              try { window.dispatchEvent(new CustomEvent('unread:refresh')) } catch {}
            }
          )
          console.log(`✅ Auto-subscribed to /user/queue/messages`)
        }
        if (!employeeSubscriptionRef.current) {
          employeeSubscriptionRef.current = client.subscribe(
            `/topic/employee-messages`,
            (message: IMessage) => {
              const newMessage = JSON.parse(message.body) as Message
              console.log('✅ [auto] BROADCAST /topic/employee-messages:', newMessage)
              setMessages((prev) => [...prev, newMessage])
              // Broadcasts may impact employee unread counters depending on backend rules
              try { window.dispatchEvent(new CustomEvent('unread:refresh')) } catch {}
            }
          )
          console.log(`✅ Auto-subscribed to /topic/employee-messages`)
        }
      },
      onDisconnect: () => {
        console.log('❌ WebSocket Disconnected')
        setConnected(false)
        // Clean up subs on disconnect
        if (subscriptionRef.current) {
          subscriptionRef.current.unsubscribe()
          subscriptionRef.current = null
        }
        if (employeeSubscriptionRef.current) {
          employeeSubscriptionRef.current.unsubscribe()
          employeeSubscriptionRef.current = null
        }
      },
      onStompError: (frame: IFrame) => {
        console.error('❌ STOMP Error:', frame.headers['message'])
        console.error('Error Details:', frame.body)
      },
    })

    client.activate()
    clientRef.current = client
  }, [])

  const subscribe = useCallback(() => {
    const client = clientRef.current
    if (!client || !client.connected) {
      console.warn('Cannot subscribe: Client not connected')
      return
    }

    // Subscribe to user-specific message queue (for customers receiving employee replies)
    // Spring automatically routes to the authenticated user based on Principal
    if (!subscriptionRef.current) {
      subscriptionRef.current = client.subscribe(
        `/user/queue/messages`,
        (message: IMessage) => {
          const newMessage = JSON.parse(message.body) as Message
          console.log('✅ Received DIRECT message on /user/queue/messages:', newMessage)
          setMessages((prev) => [...prev, newMessage])
          try { window.dispatchEvent(new CustomEvent('unread:refresh')) } catch {}
        }
      )
      console.log(`✅ Subscribed to /user/queue/messages (will receive messages for current authenticated user)`)
    }
    
    // Also subscribe to employee broadcast topic (for employees to receive all customer messages)
    if (!employeeSubscriptionRef.current) {
      employeeSubscriptionRef.current = client.subscribe(
        `/topic/employee-messages`,
        (message: IMessage) => {
          const newMessage = JSON.parse(message.body) as Message
          console.log('✅ Received BROADCAST message on /topic/employee-messages:', newMessage)
          setMessages((prev) => [...prev, newMessage])
          try { window.dispatchEvent(new CustomEvent('unread:refresh')) } catch {}
        }
      )
      console.log(`✅ Subscribed to /topic/employee-messages`)
    }
  }, [userId])

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
      console.log('Unsubscribed from user messages')
    }
    if (employeeSubscriptionRef.current) {
      employeeSubscriptionRef.current.unsubscribe()
      employeeSubscriptionRef.current = null
      console.log('Unsubscribed from employee broadcast')
    }
  }, [])

  const sendMessage = useCallback(
    async (receiverId: number, message: string) => {
      const client = clientRef.current
      if (!client || !client.connected) {
        throw new Error('WebSocket not connected')
      }

      client.publish({
        destination: '/app/chat/send',
        body: JSON.stringify({
          receiverId,
          message,
        }),
      })
    },
    []
  )

  useEffect(() => {
    connect()

    return () => {
      unsubscribe()
      if (clientRef.current) {
        clientRef.current.deactivate()
      }
    }
  }, [connect, unsubscribe])

  return {
    connected,
    sendMessage,
    messages,
    subscribe,
    unsubscribe,
  }
}
