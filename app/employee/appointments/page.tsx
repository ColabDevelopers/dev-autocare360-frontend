'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Phone } from 'lucide-react'

const appointments = [
  {
    id: 1,
    customer: 'John Doe',
    phone: '(555) 123-4567',
    vehicle: '2022 Honda Civic',
    service: 'Oil Change',
    date: '2024-01-20',
    time: '09:00 AM',
    status: 'Confirmed',
    duration: '1 hour',
  },
  {
    id: 2,
    customer: 'Jane Smith',
    phone: '(555) 987-6543',
    vehicle: '2020 Toyota Camry',
    service: 'Brake Inspection',
    date: '2024-01-20',
    time: '11:00 AM',
    status: 'In Progress',
    duration: '2 hours',
  },
  {
    id: 3,
    customer: 'Mike Johnson',
    phone: '(555) 456-7890',
    vehicle: '2019 Ford F-150',
    service: 'Transmission Service',
    date: '2024-01-20',
    time: '02:00 PM',
    status: 'Pending',
    duration: '3 hours',
  },
]

export default function EmployeeAppointments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Today's Appointments</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>January 20, 2024</span>
        </div>
      </div>

      <div className="grid gap-4">
        {appointments.map(appointment => (
          <Card key={appointment.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{appointment.service}</CardTitle>
                  <CardDescription>{appointment.vehicle}</CardDescription>
                </div>
                <Badge
                  variant={
                    appointment.status === 'Confirmed'
                      ? 'outline'
                      : appointment.status === 'In Progress'
                        ? 'default'
                        : 'secondary'
                  }
                >
                  {appointment.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Customer</p>
                    <p className="font-medium">{appointment.customer}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Phone</p>
                    <p className="font-medium">{appointment.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Time</p>
                    <p className="font-medium">{appointment.time}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-medium">{appointment.duration}</p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button size="sm">Start Service</Button>
                <Button size="sm" variant="outline">
                  Contact Customer
                </Button>
                <Button size="sm" variant="outline">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
