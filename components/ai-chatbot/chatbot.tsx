"use client"

import type React from "react"

import { useState } from "react"
// import { useChat } from "@ai-sdk/react"
// import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageCircle, Send, Bot, User, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface MockMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [messages, setMessages] = useState<MockMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const getMockResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("appointment") || input.includes("available") || input.includes("book")) {
      return "I can help you check available appointment slots! Here are some options for this week:\n\n• Tomorrow 10:00 AM - Oil Change (Available)\n• Thursday 2:00 PM - Brake Service (Available)\n• Friday 9:00 AM - AC Service (Available)\n\nWould you like me to book one of these for you?"
    }

    if (input.includes("service") || input.includes("repair")) {
      return "We offer various automotive services including:\n\n• Oil Changes ($45)\n• Brake Service ($120)\n• AC Service ($85)\n• Tire Rotation ($35)\n• Transmission Service ($200)\n• General Inspection ($60)\n\nWhich service are you interested in?"
    }

    if (input.includes("hello") || input.includes("hi") || input.includes("help")) {
      return "Hello! I'm your automotive service assistant. I can help you:\n\n• Check available appointment slots\n• Book service appointments\n• Get information about our services\n• Answer questions about your vehicle\n\nWhat can I help you with today?"
    }

    return "I understand you're asking about automotive services. While I'm currently in demo mode, I can help you navigate to the appointments page to book services or check your existing appointments. Is there something specific you'd like to know about our services?"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage: MockMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    setTimeout(() => {
      const assistantMessage: MockMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getMockResponse(userMessage.content),
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <>
      {/* Floating Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-primary hover:bg-primary/90 text-primary-foreground",
          isOpen && "hidden",
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-primary" />
              <div>
                <CardTitle className="text-lg">Service Assistant</CardTitle>
                <CardDescription>Check appointments & book services</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col space-y-4 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm">Hi! I can help you with appointment information and services.</p>
                  <p className="text-xs mt-1">Try asking: "What appointments are available tomorrow?"</p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  <div
                    className={cn(
                      "flex items-start space-x-2",
                      message.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {message.role === "assistant" && (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <Bot className="h-3 w-3 text-primary" />
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-line",
                        message.role === "user" ? "bg-primary text-primary-foreground ml-auto" : "bg-muted",
                      )}
                    >
                      {message.content}
                    </div>

                    {message.role === "user" && (
                      <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
                        <User className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about appointments..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="sm" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </>
  )
}
