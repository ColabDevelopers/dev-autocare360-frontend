'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Send, Search, MessageCircle } from 'lucide-react'
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

interface Conversation {
  userId: number
  name: string
  role: string
  lastMessage: string
  time: string
  unreadCount: number
  avatar: string
}

export default function EmployeeMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const messaging = useMessaging(currentUserId || 0)

  // Load user info and conversations on mount
  useEffect(() => {
    const loadUserAndConversations = async () => {
      try {
        const token = localStorage.getItem('accessToken')
        if (!token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

        // Get current user info
        const userResponse = await axios.get(`${apiUrl}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        // The response structure is { user: { id, ... }, roles: [...] }
        const userId = userResponse.data.user?.id || userResponse.data.id
        console.log('User data:', userResponse.data, 'userId:', userId)
        setCurrentUserId(userId)

        // Get conversations
        await loadConversations()
      } catch (error) {
        console.error('Error loading conversations:', error)
      }
    }

    loadUserAndConversations()
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
      
      console.log('Employee received WebSocket message:', latestMessage)
      console.log('Selected conversation:', selectedConversation)
      
      // If message is from the selected customer's thread, add to chat
      if (selectedConversation) {
        // Consider a message related if it's to/from the selected customer, regardless of which employee sent it
        // - Customer -> broadcast (receiverId null) OR to any employee
        // - Any employee -> selected customer
        const isRelated =
          latestMessage.senderId === selectedConversation.userId ||
          latestMessage.receiverId === selectedConversation.userId
        
        console.log('Is message related to open conversation?', isRelated)
        
        if (isRelated) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === latestMessage.id)) {
              console.log('Duplicate message, skipping')
              return prev
            }
            console.log('Adding message to conversation')
            return [...prev, latestMessage]
          })
        }
      }
      
      // Always reload conversations to update last message and unread counts
      loadConversations()
    }
  }, [messaging.messages, selectedConversation, currentUserId])

  // Load conversation messages when selected
  useEffect(() => {
    if (selectedConversation) {
      loadConversationMessages(selectedConversation.userId)
    }
  }, [selectedConversation])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Filter conversations based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations)
    } else {
      const filtered = conversations.filter(conv =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredConversations(filtered)
    }
  }, [searchQuery, conversations])

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      const response = await axios.get(
        `${apiUrl}/api/messages/conversations`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setConversations(response.data)
      setFilteredConversations(response.data)
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadConversationMessages = async (otherUserId: number) => {
    try {
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      // Employees need the full shared thread for the customer across all employees
      const response = await axios.get(
        `${apiUrl}/api/messages/employee/customer/${otherUserId}/all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )
      setMessages(response.data)

      // Mark messages as read
      await axios.put(
        `${apiUrl}/api/messages/read/${otherUserId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      // Notify UI to refresh unread badges immediately
      try { window.dispatchEvent(new CustomEvent('unread:refresh')) } catch {}

      // Reload conversations to clear unread count
      await loadConversations()
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    try {
      const token = localStorage.getItem('accessToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
      
      // Send via REST API
      const response = await axios.post(
        `${apiUrl}/api/messages`,
        {
          receiverId: selectedConversation.userId,
          message: newMessage
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

  // Add sent message to local state immediately (dedupe by id in case broadcast also arrives)
  setMessages(prev => prev.some(m => m.id === response.data.id) ? prev : [...prev, response.data])
      setNewMessage('')
      
      // Reload conversations to update last message
      await loadConversations()
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatConversationTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <Badge variant={messaging.connected ? "default" : "secondary"}>
          {messaging.connected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      {/* WhatsApp Web Style Two-Column Layout */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] h-[calc(100vh-12rem)] min-h-0">
          {/* Left Column: Customer List */}
          <div className="border-r flex flex-col bg-muted/20 min-h-0">
            {/* Search Bar */}
            <div className="p-3 border-b bg-background">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  className="pl-10 h-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-sm font-medium text-muted-foreground">
                    {searchQuery ? 'No customers found' : 'No messages yet'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {searchQuery ? 'Try a different search' : 'Customer messages will appear here'}
                  </p>
                </div>
              ) : (
                filteredConversations.map(conversation => (
                  <div
                    key={conversation.userId}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`flex items-center space-x-3 p-3 border-b hover:bg-background cursor-pointer transition-all ${
                      selectedConversation?.userId === conversation.userId 
                        ? 'bg-background border-l-4 border-l-primary' 
                        : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={conversation.avatar || '/placeholder.svg'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {conversation.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-bold">
                            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className={`font-medium truncate ${conversation.unreadCount > 0 ? 'text-foreground' : 'text-foreground/90'}`}>
                          {conversation.name}
                        </p>
                        <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conversation.time}
                        </p>
                      </div>
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Chat Area */}
          <div className="flex flex-col bg-background min-h-0">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-background shadow-sm shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-11 w-11">
                        <AvatarImage src={selectedConversation.avatar || '/placeholder.svg'} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {selectedConversation.name
                            .split(' ')
                            .map(n => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-base">{selectedConversation.name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                          {selectedConversation.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-[url('/grid.svg')] bg-muted/5">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <MessageCircle className="h-20 w-20 text-muted-foreground mb-4 opacity-20" />
                      <p className="text-muted-foreground font-medium">No messages yet</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Start the conversation with {selectedConversation.name}
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        // In employee view, any message not sent by the selected customer
                        // is considered an outgoing (employee-side) message and should appear on the right.
                        const isOutgoing = message.senderId !== selectedConversation.userId
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
                                      {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="w-8"></div>
                                )}
                              </div>
                            )}
                            <div
                              className={`max-w-[65%] px-3 py-2 rounded-lg shadow-sm ${
                                isOutgoing
                                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                                  : 'bg-background border rounded-bl-sm'
                              }`}
                            >
                              <p className="text-sm leading-relaxed wrap-break-word whitespace-pre-wrap">
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
              </>
            ) : (
              <div className="h-full flex items-center justify-center p-8 bg-[url('/grid.svg')] bg-muted/5">
                <div className="text-center">
                  <div className="mb-6 relative">
                    <MessageCircle className="h-24 w-24 mx-auto text-muted-foreground opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-16 w-16 bg-primary/10 rounded-full"></div>
                    </div>
                  </div>
                  <p className="text-xl font-semibold text-foreground mb-2">
                    Welcome to Customer Support
                  </p>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Select a customer conversation from the list to view and respond to their messages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

