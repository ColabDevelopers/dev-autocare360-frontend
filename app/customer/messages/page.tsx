"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Send, Search, MessageCircle } from "lucide-react"

const conversations = [
  {
    id: 1,
    name: "Mike Johnson",
    role: "Technician",
    lastMessage: "Your brake inspection is complete. Please review the report.",
    time: "2 min ago",
    unread: 2,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 2,
    name: "Sarah Wilson",
    role: "Service Advisor",
    lastMessage: "Thank you for choosing our service. Your appointment is confirmed.",
    time: "1 hour ago",
    unread: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: 3,
    name: "AutoCare360 Support",
    role: "Support Team",
    lastMessage: "We've received your feedback and will address it promptly.",
    time: "Yesterday",
    unread: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

export default function CustomerMessages() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <Button>
          <MessageCircle className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search messages..." className="pl-10" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <Avatar>
                  <AvatarImage src={conversation.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {conversation.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{conversation.name}</p>
                    {conversation.unread > 0 && (
                      <Badge variant="default" className="ml-2">
                        {conversation.unread}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{conversation.role}</p>
                  <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  <p className="text-xs text-muted-foreground">{conversation.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>MJ</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Mike Johnson</CardTitle>
                <CardDescription>Technician • Online</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-96 border rounded-lg p-4 overflow-y-auto space-y-4">
              {/* Sample messages */}
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Hi! I've completed the brake inspection on your vehicle.</p>
                  <p className="text-xs text-muted-foreground mt-1">10:30 AM</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Great! What did you find?</p>
                  <p className="text-xs opacity-70 mt-1">10:32 AM</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg max-w-xs">
                  <p className="text-sm">
                    The front brake pads are at 20% and should be replaced soon. I've sent you a detailed report.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">10:35 AM</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <Input placeholder="Type your message..." className="flex-1" />
              <Button>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
