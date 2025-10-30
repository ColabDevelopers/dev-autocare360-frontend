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
    const socket = new SockJS(`${apiUrl}/ws`)
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str: string) => {
        console.log('STOMP Debug:', str)
      },
      onConnect: () => {
        console.log('WebSocket Connected')
        setConnected(true)
      },
      onDisconnect: () => {
        console.log('WebSocket Disconnected')
        setConnected(false)
      },
      onStompError: (frame: IFrame) => {
        console.error('STOMP Error:', frame.headers['message'])
        console.error('Details:', frame.body)
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
    subscriptionRef.current = client.subscribe(
      `/user/${userId}/queue/messages`,
      (message: IMessage) => {
        const newMessage = JSON.parse(message.body) as Message
        console.log('Received message:', newMessage)
        setMessages((prev) => [...prev, newMessage])
      }
    )
    console.log(`Subscribed to /user/${userId}/queue/messages`)
    
    // Also subscribe to employee broadcast topic (for employees to receive all customer messages)
    employeeSubscriptionRef.current = client.subscribe(
      `/topic/employee-messages`,
      (message: IMessage) => {
        const newMessage = JSON.parse(message.body) as Message
        console.log('Received broadcast message:', newMessage)
        setMessages((prev) => [...prev, newMessage])
      }
    )
    console.log(`Subscribed to /topic/employee-messages`)
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
