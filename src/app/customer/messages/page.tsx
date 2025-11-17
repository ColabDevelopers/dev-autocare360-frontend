'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, MessageCircle, AlertCircle } from 'lucide-react'
import { useMessaging } from '@/hooks/use-messaging'
import axios from 'axios'

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

interface Employee {
  id: number
  name: string
  email: string
  role: string
}

export default function CustomerMessages() {
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messaging = useMessaging(currentUserId || 0)
  const processedSendersRef = useRef<Set<number>>(new Set())

  // Helper: mark all messages from a given employee sender as read for this customer
  const markSenderAsRead = async (senderId: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) return
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      await axios.put(
        `${apiUrl}/api/messages/read/${senderId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      // Let headers/sidebars refresh unread badges immediately
      try {
        window.dispatchEvent(new CustomEvent('unread:refresh'))
      } catch {}
    } catch (e) {
      console.warn('Failed to mark messages as read for sender', senderId, e)
    }
  }

  // Load user info and designated employee on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        console.log('Token check:', {
          exists: !!token,
          length: token?.length,
          preview: token?.substring(0, 20) + '...',
        })

        if (!token) {
          setError('Not authenticated. Please log in.')
          setLoading(false)
          return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        console.log('API URL:', apiUrl)

        // Get current user info
        const userResponse = await axios.get(`${apiUrl}/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
        console.log('Current user:', userResponse.data)
        setCurrentUserId(userResponse.data.id)

        // Get designated employee (shared support inbox - can be null)
        try {
          const employeeResponse = await axios.get(`${apiUrl}/api/messages/designated-employee`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          })
          console.log('Designated employee:', employeeResponse.data)
          setEmployee(employeeResponse.data)

          // Load existing conversation (all messages to/from employee pool)
          await loadConversation(userResponse.data.id, token, apiUrl)
        } catch (empError: any) {
          console.warn('No employee found or error:', empError)
          // Continue even if no employee - customer can still send to pool
          setEmployee({
            id: 0,
            name: 'Support',
            email: 'support@autocare360.com',
            role: 'EMPLOYEE',
          })
        }
      } catch (error: any) {
        console.error('Error loading data:', error)
        if (error.response?.status === 401 || error.response?.status === 403) {
          setError('Session expired. Please log in again.')
        } else {
          setError('Failed to load messages. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Subscribe to WebSocket when user ID is available
  useEffect(() => {
    if (currentUserId) {
      messaging.subscribe()
    }
    return () => {
      messaging.unsubscribe()
    }
  }, [currentUserId, messaging])

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (messaging.messages.length > 0) {
      const latestMessage = messaging.messages[messaging.messages.length - 1]
      console.log('Customer received WebSocket message:', latestMessage)
      console.log('Current user ID:', currentUserId)
      console.log('Message sender ID:', latestMessage.senderId)
      console.log('Message receiver ID:', latestMessage.receiverId)

      // Add message if it's relevant to this customer
      // 1. Customer sent it (senderId = currentUserId)
      // 2. Employee sent it to this customer (receiverId = currentUserId)
      const isRelevant =
        latestMessage.senderId === currentUserId || latestMessage.receiverId === currentUserId

      console.log('Is message relevant to customer?', isRelevant)

      if (isRelevant) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === latestMessage.id)) {
            console.log('Duplicate message, skipping')
            return prev
          }
          console.log('Adding message to customer chat')
          return [...prev, latestMessage]
        })

        // If this is an employee -> customer message, mark it as read immediately
        if (
          latestMessage.receiverId === currentUserId &&
          latestMessage.senderId !== currentUserId
        ) {
          markSenderAsRead(latestMessage.senderId)
        }
      } else {
        console.log('Message not relevant to this customer, skipping')
      }
    }
  }, [messaging.messages, currentUserId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // After messages load/update, mark any unread employee messages as read (deduped per sender)
  useEffect(() => {
    if (!currentUserId || messages.length === 0) return
    const pendingSenderIds = new Set<number>()
    for (const m of messages) {
      const isIncomingFromEmployee =
        m.receiverId === currentUserId && m.senderId !== currentUserId && !m.isRead
      if (isIncomingFromEmployee && !processedSendersRef.current.has(m.senderId)) {
        pendingSenderIds.add(m.senderId)
      }
    }
    if (pendingSenderIds.size > 0) {
      pendingSenderIds.forEach(async sid => {
        processedSendersRef.current.add(sid)
        await markSenderAsRead(sid)
      })
    }
  }, [messages, currentUserId])

  const loadConversation = async (userId: number, token?: string, apiUrl?: string) => {
    try {
      const authToken = token || localStorage.getItem('accessToken')
      const url = apiUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

      console.log('Loading all customer messages for userId:', userId)

      // Use the dedicated customer messages endpoint
      // This loads ALL messages (broadcasts sent + employee replies received)
      const messagesResponse = await axios.get(`${url}/api/messages/customer/all`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      console.log('Loaded customer messages:', messagesResponse.data)
      setMessages(messagesResponse.data)
    } catch (error) {
      console.error('Error loading customer messages:', error)
      // Even on error, set empty array to show UI
      setMessages([])
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      console.log('Empty message, not sending')
      return
    }

    try {
      const token = localStorage.getItem('accessToken')

      if (!token) {
        setError('Not authenticated. Please log in again.')
        console.error('No token found in localStorage')
        return
      }

      console.log('Sending message:', {
        token_preview: token.substring(0, 20) + '...',
        message: newMessage,
        receiverId: null,
      })

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

      // Send message to employee pool (receiverId = null)
      const response = await axios.post(
        `${apiUrl}/api/messages`,
        {
          receiverId: null, // Broadcast to employee pool
          message: newMessage,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      console.log('Message sent successfully:', response.data)

      // Don't add to local state - WebSocket will handle it
      // setMessages(prev => [...prev, response.data])
      setNewMessage('')
      setError(null)
    } catch (error: any) {
      console.error('Error sending message:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)

      if (error.response?.status === 401 || error.response?.status === 403) {
        setError('Session expired. Please log out and log in again.')
        // Optionally redirect to login
        // window.location.href = '/login'
      } else {
        setError('Failed to send message. Please try again.')
      }
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading messages...</p>
      </div>
    )
  }

  if (error && error.includes('log in')) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
        <Button onClick={() => (window.location.href = '/login')}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <Badge variant={messaging.connected ? 'default' : 'secondary'}>
          {messaging.connected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card className="h-[calc(100vh-12rem)]">
        <div className="h-full flex flex-col">
          {/* Header with employee info */}
          <CardHeader className="border-b flex-shrink-0">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  {employee?.name
                    .split(' ')
                    .map(n => n[0])
                    .join('') || 'SP'}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{employee?.name || 'Support Team'}</CardTitle>
                <CardDescription>
                  {employee?.role || 'Employee'} • {messaging.connected ? 'Online' : 'Offline'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg font-medium">No messages yet</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Start a conversation with our support team
                  </p>
                </div>
              ) : (
                <>
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === currentUserId ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] p-3 rounded-lg shadow-sm ${
                          message.senderId === currentUserId
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-white dark:bg-gray-800 border rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm break-words whitespace-pre-wrap">{message.message}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.senderId === currentUserId
                              ? 'opacity-70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-white dark:bg-gray-900 flex-shrink-0">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  className="flex-1"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  disabled={loading || !!error}
                  autoFocus
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || loading || !!error}
                  type="button"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
