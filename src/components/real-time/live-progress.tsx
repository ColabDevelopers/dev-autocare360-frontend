'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useWebSocket } from '@/lib/websocket'
import { Car, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import type { ActiveService } from '@/services/customerDashboard'

interface LiveProgressProps {
  services: ActiveService[]
}

export function LiveProgress({ services: initialServices }: LiveProgressProps) {
  const { messages, isConnected } = useWebSocket()
  const [services, setServices] = useState<ActiveService[]>(initialServices)

  useEffect(() => {
    setServices(initialServices)
  }, [initialServices])

  useEffect(() => {
    const serviceUpdates = messages.filter(msg => msg.type === 'service_update')

    serviceUpdates.forEach(update => {
      setServices(prev =>
        prev.map(service =>
          service.id === update.data.serviceId
            ? {
                ...service,
                progress: update.data.progress || service.progress,
                status: update.data.status || service.status,
                currentStep: update.data.currentStep || service.currentStep,
                lastUpdate: 'Just now',
              }
            : service
        )
      )
    })
  }, [messages])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <Car className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in-progress':
        return 'secondary'
      case 'delayed':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Live Service Progress</h2>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {services.map(service => (
        <Card key={service.id} className="transition-all duration-300 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(service.status)}
                <CardTitle className="text-lg">{service.id}</CardTitle>
                <Badge variant={getStatusColor(service.status) as any}>
                  {service.status.replace('-', ' ')}
                </Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                ETA: {service.estimatedCompletion}
              </span>
            </div>
            <CardDescription>
              {service.vehicleInfo} • {service.serviceType}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{service.progress}%</span>
              </div>
              <Progress value={service.progress} className="h-2" />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Current Step:</span>
              <span className="font-medium">{service.currentStep}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Last Update:</span>
              <span>{service.lastUpdate}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
