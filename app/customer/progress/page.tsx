'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

const activeServices = [
  {
    id: 1,
    service: 'Oil Change & Filter',
    vehicle: '2022 Honda Civic',
    progress: 100,
    status: 'Completed',
    startTime: '09:00 AM',
    endTime: '10:30 AM',
    technician: 'John Smith',
    notes: 'Service completed successfully. Next service due in 6 months.',
  },
  {
    id: 2,
    service: 'Brake Inspection',
    vehicle: '2020 Toyota Camry',
    progress: 75,
    status: 'In Progress',
    startTime: '10:45 AM',
    endTime: '12:00 PM',
    technician: 'Mike Johnson',
    notes: 'Front brake pads need replacement. Waiting for customer approval.',
  },
  {
    id: 3,
    service: 'Transmission Service',
    vehicle: '2019 Ford F-150',
    progress: 25,
    status: 'Started',
    startTime: '01:00 PM',
    endTime: '03:30 PM',
    technician: 'Sarah Wilson',
    notes: 'Initial inspection completed. Proceeding with fluid change.',
  },
]

export default function CustomerProgress() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Service Progress</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Real-time updates</span>
        </div>
      </div>

      <div className="grid gap-6">
        {activeServices.map(service => (
          <Card key={service.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{service.service}</CardTitle>
                  <CardDescription>{service.vehicle}</CardDescription>
                </div>
                <Badge
                  variant={
                    service.status === 'Completed'
                      ? 'default'
                      : service.status === 'In Progress'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="flex items-center space-x-1"
                >
                  {service.status === 'Completed' && <CheckCircle className="h-3 w-3" />}
                  {service.status === 'In Progress' && <AlertCircle className="h-3 w-3" />}
                  {service.status === 'Started' && <Clock className="h-3 w-3" />}
                  <span>{service.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{service.progress}%</span>
                </div>
                <Progress value={service.progress} className="h-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Time Slot</p>
                    <p className="font-medium">
                      {service.startTime} - {service.endTime}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground">Technician</p>
                  <p className="font-medium">{service.technician}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-medium">{service.status}</p>
                </div>
              </div>

              {service.notes && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Latest Update:</p>
                  <p className="text-sm">{service.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
