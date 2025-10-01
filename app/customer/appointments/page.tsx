'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CalendarIcon, Clock, Plus, Edit, X, Wrench } from 'lucide-react'

// Mock data
const mockAppointments = [
  {
    id: 1,
    service: 'Oil Change',
    vehicle: '2020 Toyota Camry',
    date: '2024-01-18',
    time: '10:00 AM',
    status: 'Confirmed',
    technician: 'Mike Johnson',
    notes: 'Regular maintenance',
  },
  {
    id: 2,
    service: 'AC Service',
    vehicle: '2019 Honda Civic',
    date: '2024-01-22',
    time: '2:00 PM',
    status: 'Pending',
    technician: 'TBD',
    notes: 'AC not cooling properly',
  },
  {
    id: 3,
    service: 'Brake Inspection',
    vehicle: '2020 Toyota Camry',
    date: '2024-01-15',
    time: '9:00 AM',
    status: 'Completed',
    technician: 'Sarah Wilson',
    notes: 'Annual inspection',
  },
]

const services = [
  { id: 'oil-change', name: 'Oil Change', duration: '30 min', price: '$45' },
  { id: 'brake-service', name: 'Brake Service', duration: '2 hours', price: '$120' },
  { id: 'tire-rotation', name: 'Tire Rotation', duration: '45 min', price: '$35' },
  { id: 'ac-service', name: 'AC Service', duration: '1.5 hours', price: '$85' },
  { id: 'transmission', name: 'Transmission Service', duration: '3 hours', price: '$200' },
  { id: 'inspection', name: 'General Inspection', duration: '1 hour', price: '$60' },
]

const timeSlots = [
  '8:00 AM',
  '9:00 AM',
  '10:00 AM',
  '11:00 AM',
  '1:00 PM',
  '2:00 PM',
  '3:00 PM',
  '4:00 PM',
  '5:00 PM',
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(mockAppointments)
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [bookingForm, setBookingForm] = useState({
    service: '',
    vehicle: '',
    date: '',
    time: '',
    notes: '',
  })

  const handleBookAppointment = () => {
    const newAppointment = {
      id: appointments.length + 1,
      service: services.find(s => s.id === bookingForm.service)?.name || '',
      vehicle: bookingForm.vehicle,
      date: bookingForm.date,
      time: bookingForm.time,
      status: 'Pending',
      technician: 'TBD',
      notes: bookingForm.notes,
    }
    setAppointments([...appointments, newAppointment])
    setBookingForm({
      service: '',
      vehicle: '',
      date: '',
      time: '',
      notes: '',
    })
    setIsBookingDialogOpen(false)
  }

  const handleCancelAppointment = (id: number) => {
    setAppointments(appointments.filter(a => a.id !== id))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-green-500/10 text-green-500'
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'Completed':
        return 'bg-blue-500/10 text-blue-500'
      case 'Cancelled':
        return 'bg-red-500/10 text-red-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const upcomingAppointments = appointments.filter(
    a => a.status !== 'Completed' && a.status !== 'Cancelled'
  )
  const pastAppointments = appointments.filter(
    a => a.status === 'Completed' || a.status === 'Cancelled'
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground text-balance">Appointments</h1>
          <p className="text-muted-foreground text-balance">
            Manage your service appointments and bookings.
          </p>
        </div>
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Book New Appointment</DialogTitle>
              <DialogDescription>
                Schedule a service appointment for your vehicle.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label>Select Service</Label>
                <Select onValueChange={value => setBookingForm({ ...bookingForm, service: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex justify-between w-full">
                          <span>{service.name}</span>
                          <span className="text-muted-foreground ml-4">{service.price}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Vehicle</Label>
                <Select onValueChange={value => setBookingForm({ ...bookingForm, vehicle: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2020 Toyota Camry">2020 Toyota Camry (ABC-1234)</SelectItem>
                    <SelectItem value="2019 Honda Civic">2019 Honda Civic (XYZ-5678)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={date => {
                      setSelectedDate(date)
                      setBookingForm({
                        ...bookingForm,
                        date: date?.toISOString().split('T')[0] || '',
                      })
                    }}
                    disabled={date => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Available Times</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {timeSlots.map(time => (
                      <Button
                        key={time}
                        variant={bookingForm.time === time ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setBookingForm({ ...bookingForm, time })}
                        className="justify-start"
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Notes</Label>
                <Textarea
                  placeholder="Any specific concerns or requests..."
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookAppointment} className="bg-primary hover:bg-primary/90">
                Book Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <Card className="border-border/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No upcoming appointments</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Book your next service appointment to keep your vehicle in top condition.
                </p>
                <Button onClick={() => setIsBookingDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingAppointments.map(appointment => (
                <Card key={appointment.id} className="border-border/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-primary/10 p-3 rounded-lg">
                          <Wrench className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{appointment.service}</h3>
                          <p className="text-muted-foreground">{appointment.vehicle}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{appointment.date}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="mr-1 h-3 w-3" />
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCancelAppointment(appointment.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <X className="mr-1 h-3 w-3" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                    {appointment.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm">{appointment.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          <div className="grid gap-4">
            {pastAppointments.map(appointment => (
              <Card key={appointment.id} className="border-border/50 opacity-75">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-muted p-3 rounded-lg">
                        <Wrench className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{appointment.service}</h3>
                        <p className="text-muted-foreground">{appointment.vehicle}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <CalendarIcon className="h-4 w-4" />
                            <span>{appointment.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{appointment.time}</span>
                          </div>
                          <span>Technician: {appointment.technician}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle>Appointment Calendar</CardTitle>
              <CardDescription>View all your appointments in calendar format</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border w-full"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
