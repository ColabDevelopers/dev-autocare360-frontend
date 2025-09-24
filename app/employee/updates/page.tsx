"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, FileText, Send } from "lucide-react"

const recentUpdates = [
  {
    id: 1,
    service: "Brake Inspection - Honda Civic",
    customer: "John Doe",
    update: "Completed brake pad inspection. Front pads at 20%, recommend replacement.",
    timestamp: "2 hours ago",
    photos: 2,
  },
  {
    id: 2,
    service: "Oil Change - Toyota Camry",
    customer: "Jane Smith",
    update: "Oil change completed successfully. Used synthetic 5W-30 as requested.",
    timestamp: "4 hours ago",
    photos: 1,
  },
]

export default function EmployeeUpdates() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Service Updates</h1>
        <Badge variant="secondary">Real-time sync enabled</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Update</CardTitle>
            <CardDescription>Send progress updates to customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="service">Service/Project</Label>
              <Input id="service" placeholder="Select active service..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="update">Update Message</Label>
              <Textarea id="update" placeholder="Describe the current progress, findings, or next steps..." rows={4} />
            </div>

            <div className="space-y-2">
              <Label>Attachments</Label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Camera className="h-4 w-4 mr-2" />
                  Add Photos
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Add Document
                </Button>
              </div>
            </div>

            <Button className="w-full">
              <Send className="h-4 w-4 mr-2" />
              Send Update
            </Button>
          </CardContent>
        </Card>

        {/* Recent Updates */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Updates</CardTitle>
            <CardDescription>Your latest customer communications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentUpdates.map((update) => (
              <div key={update.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{update.service}</h4>
                  <span className="text-xs text-muted-foreground">{update.timestamp}</span>
                </div>
                <p className="text-sm text-muted-foreground">Customer: {update.customer}</p>
                <p className="text-sm">{update.update}</p>
                {update.photos > 0 && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Camera className="h-3 w-3" />
                    <span>
                      {update.photos} photo{update.photos > 1 ? "s" : ""} attached
                    </span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
