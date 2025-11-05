'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Send, MessageCircle } from 'lucide-react'
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

interface MessagingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: number
  customerName: string
  customerEmail: string
}

export function MessagingDialog({
  open,
  onOpenChange,
  customerId,
  customerName,
  customerEmail,
}: MessagingDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const messaging = useMessaging(currentUserId || 0)

  // Load current user info
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
        const userResponse = await axios.get(`${apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        const userId = userResponse.data.user?.id || userResponse.data.id
        setCurrentUserId(userId)
      } catch (error) {
        console.error('Error loading user:', error)
      }
    }

    if (open) {
      loadUser()
    }
  }, [open])

  // Subscribe to WebSocket when user ID is available
  useEffect(() => {
    if (currentUserId && open) {
      messaging.subscribe()
    }
    return () => {
      messaging.unsubscribe()
    }
  }, [currentUserId, open, messaging])

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (messaging.messages.length > 0 && open) {
      const latestMessage = messaging.messages[messaging.messages.length - 1]
      
      // Check if message is related to this customer
      const isRelated =
        latestMessage.senderId === customerId ||
        latestMessage.receiverId === customerId
      
      if (isRelated) {
        setMessages(prev => {
          // Avoid duplicates
          if (prev.some(m => m.id === latestMessage.id)) {
            return prev
          }
          return [...prev, latestMessage]
        })
      }
    }
  }, [messaging.messages, customerId, open])

  // Load messages when dialog opens
  useEffect(() => {
    if (open && customerId) {
      loadMessages()
    }
  }, [open, customerId])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      
      const response = await axios.get(
        `${apiUrl}/api/messages/employee/customer/${customerId}/all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setMessages(response.data)

      // Mark messages as read
      await axios.put(
        `${apiUrl}/api/messages/read/${customerId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Notify UI to refresh unread badges
      try { window.dispatchEvent(new CustomEvent('unread:refresh')) } catch {}
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    try {
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      
      const response = await axios.post(
        `${apiUrl}/api/messages`,
        {
          receiverId: customerId,
          message: newMessage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Add sent message to local state
      setMessages(prev => prev.some(m => m.id === response.data.id) ? prev : [...prev, response.data])
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[600px] flex flex-col p-0">
        {/* Chat Header */}
        <DialogHeader className="p-4 border-b shrink-0">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getInitials(customerName)}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-base">{customerName}</DialogTitle>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {messaging.connected && (
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                )}
                {customerEmail}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[url('/grid.svg')] bg-muted/5">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground mb-3 opacity-20" />
              <p className="text-muted-foreground font-medium">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Start the conversation with {customerName}
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOutgoing = message.senderId !== customerId
                const showAvatar = !isOutgoing && (
                  index === 0 || 
                  messages[index - 1].senderId !== message.senderId
                )
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${isOutgoing ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isOutgoing && (
                      <div className="shrink-0">
                        {showAvatar ? (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-muted text-xs">
                              {getInitials(customerName)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="w-8"></div>
                        )}
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] px-3 py-2 rounded-lg shadow-sm ${
                        isOutgoing
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-background border rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {message.message}
                      </p>
                      <p
                        className={`text-xs mt-1 flex items-center gap-1 ${
                          isOutgoing ? 'opacity-70 justify-end' : 'text-muted-foreground'
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                        {isOutgoing && (
                          <span className="text-xs">
                            {message.isRead ? '✓✓' : '✓'}
                          </span>
                        )}
                      </p>
                    </div>
                    {isOutgoing && <div className="w-8"></div>}
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background shrink-0">
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              className="flex-1"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              autoFocus
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim()}
              className="px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
