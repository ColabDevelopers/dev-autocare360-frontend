'use client'

import { useState, useEffect } from 'react'
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
import { CalendarIcon, Clock, Plus, Edit, X, Wrench, Loader2 } from 'lucide-react'
import { API_CONFIG } from '@/lib/api'

// Types
interface Appointment {
  id: number; // Changed from string to number to match backend
  service: string;
  vehicle: string;
  date: string;
  time: string;
  status: string;
  technician?: string;
  notes?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Service {
  id: string;
  name: string;
  duration: string;
  price: string;
}

const services: Service[] = [
  { id: 'oil-change', name: 'Oil Change', duration: '30 min', price: '$45' },
  { id: 'brake-service', name: 'Brake Service', duration: '2 hours', price: '$120' },
  { id: 'tire-rotation', name: 'Tire Rotation', duration: '45 min', price: '$35' },
  { id: 'ac-service', name: 'AC Service', duration: '1.5 hours', price: '$85' },
  { id: 'transmission', name: 'Transmission Service', duration: '3 hours', price: '$200' },
  { id: 'inspection', name: 'General Inspection', duration: '1 hour', price: '$60' },
]

const vehicles = [
  { id: '1', name: '2020 Toyota Camry', plate: 'ABC-1234' },
  { id: '2', name: '2019 Honda Civic', plate: 'XYZ-5678' },
]

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [bookingForm, setBookingForm] = useState({
    service: '',
    vehicle: '',
    date: '',
    time: '',
    notes: '',
  })
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null)

  // Fetch appointments on load
  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}/user/1`) // Using user ID 1 for demo
      if (!res.ok) throw new Error('Failed to fetch appointments')
      const data = await res.json()
      // Normalize time strings (strip seconds if present) so UI comparisons match availableTimes (HH:mm)
      const normalized = (data || []).map((a: any) => ({
        ...a,
        date: a.date, // keep as-is (YYYY-MM-DD)
        time: a.time && typeof a.time === 'string' ? (a.time.length > 5 ? a.time.substring(0,5) : a.time) : a.time,
      }))
      setAppointments(normalized)
    } catch (err) {
      setError('Failed to load appointments')
    } finally {
      setLoading(false)
    }
  }

  // Fetch available times for selected date
  const fetchAvailability = async (date: Date) => {
    try {
      const formatDateLocal = (d?: Date) => {
        if (!d) return ''
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      }
      const dateStr = formatDateLocal(date)
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AVAILABILITY}?date=${dateStr}`)
      if (!res.ok) throw new Error('Failed to fetch availability')
      const data = await res.json()
      setAvailableTimes(data.timeSlots || []) // Use timeSlots from backend response
    } catch (err) {
      setAvailableTimes([])
    }
  }

  const handleBookAppointment = async () => {
    if (!bookingForm.service || !bookingForm.vehicle || !bookingForm.date || !bookingForm.time) {
      alert('Please fill all required fields')
      return
    }
    try {
      setIsBooking(true)
      // Ensure date is YYYY-MM-DD and time is HH:mm[:ss]
      const normalizedDate = bookingForm.date
      let normalizedTime = bookingForm.time
      if (normalizedTime && normalizedTime.length === 5) {
        // append seconds
        normalizedTime = normalizedTime + ':00'
      }

      const payload = {
        userId: 1, // Using user ID 1 for demo
        service: services.find(s => s.id === bookingForm.service)?.name || '',
        vehicle: bookingForm.vehicle,
        date: normalizedDate,
        time: normalizedTime,
        status: isRescheduling && selectedAppointment ? selectedAppointment.status : 'PENDING',
        notes: bookingForm.notes,
      }
      const url = isRescheduling && selectedAppointment 
        ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${selectedAppointment.id}` 
        : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}`
      const method = isRescheduling ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        // Try to read error message from response body
        let msg = 'Failed to book appointment'
        try {
          const body = await res.text()
          if (body) msg = body
        } catch (e) {
          // ignore
        }
        throw new Error(msg)
      }
      await fetchAppointments() // Refresh list
      // show success message
      if (isRescheduling) {
        alert('Appointment rescheduled successfully')
      } else {
        alert('Appointment booked successfully')
      }
      setBookingForm({ service: '', vehicle: '', date: '', time: '', notes: '' })
      setIsBookingDialogOpen(false)
      setIsRescheduling(false)
      setSelectedAppointment(null)
    } catch (err) {
      alert((err as any)?.message || 'Failed to book appointment')
    } finally {
      setIsBooking(false)
    }
  }

  const handleCancelAppointment = async (id: number) => {
    try {
      const res = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.APPOINTMENTS}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to cancel')
      setAppointments(appointments.filter(a => a.id !== id))
    } catch (err) {
      alert('Failed to cancel appointment')
    }
  }

  const confirmDelete = async () => {
    if (!appointmentToDelete) return
    try {
      await handleCancelAppointment(appointmentToDelete.id)
      // Refresh from server to ensure consistency
      await fetchAppointments()
      setIsDeleteDialogOpen(false)
      setAppointmentToDelete(null)
    } catch (err) {
      // handleCancelAppointment already alerts on failure
    }
  }

  const handleReschedule = (appointment: Appointment) => {
    setIsRescheduling(true)
    setSelectedAppointment(appointment)
    setBookingForm({
      service: services.find(s => s.name === appointment.service)?.id || '',
      vehicle: appointment.vehicle,
      date: appointment.date,
      time: appointment.time,
      notes: appointment.notes || '',
    })
    // Parse YYYY-MM-DD into a local Date object without timezone shifts
    const parseDateOnly = (d: string) => {
      if (!d) return undefined
      const parts = d.split('-')
      if (parts.length !== 3) return new Date(d)
      const y = parseInt(parts[0], 10)
      const m = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      return new Date(y, m, day)
    }
    const parsed = parseDateOnly(appointment.date)
    setSelectedDate(parsed)
    if (parsed) fetchAvailability(parsed)
    setIsBookingDialogOpen(true)
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
        <Dialog open={isBookingDialogOpen} onOpenChange={open => {
          setIsBookingDialogOpen(open)
          if (!open) {
            setIsRescheduling(false)
            setSelectedAppointment(null)
            setBookingForm({ service: '', vehicle: '', date: '', time: '', notes: '' })
            setAvailableTimes([])
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Book Appointment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>{isRescheduling ? 'Reschedule Appointment' : 'Book New Appointment'}</DialogTitle>
              <DialogDescription>
                {isRescheduling ? 'Update your appointment details.' : 'Schedule a service appointment for your vehicle.'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4 overflow-y-auto flex-1 pr-2">
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
                    {vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.name}>
                        {vehicle.name} ({vehicle.plate})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Date</Label>
                  <div className="max-h-80 overflow-auto">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={date => {
                        setSelectedDate(date)
                        const formatDateLocal = (d?: Date) => {
                          if (!d) return ''
                          const y = d.getFullYear()
                          const m = String(d.getMonth() + 1).padStart(2, '0')
                          const day = String(d.getDate()).padStart(2, '0')
                          return `${y}-${m}-${day}`
                        }
                        setBookingForm({
                          ...bookingForm,
                          date: formatDateLocal(date),
                        })
                        if (date) fetchAvailability(date)
                      }}
                      disabled={date => date < new Date()}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Available Times</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto border rounded-md p-3">
                    {availableTimes.length > 0 ? (
                      availableTimes.map((time: string) => (
                        <Button
                          key={time}
                          variant={bookingForm.time === time ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setBookingForm({ ...bookingForm, time })}
                          className="justify-start"
                        >
                          {time}
                        </Button>
                      ))
                    ) : (
                      <div className="col-span-2 text-center text-muted-foreground py-4">
                        {bookingForm.date ? 'No available times for selected date' : 'Please select a date first'}
                      </div>
                    )}
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
            <div className="flex justify-end space-x-2 flex-shrink-0 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsBookingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleBookAppointment} disabled={isBooking} className="bg-primary hover:bg-primary/90">
                {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isRescheduling ? 'Reschedule' : 'Book'} Appointment
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading && (
        <div className="text-center py-4">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading appointments...
        </div>
      )}
      {error && (
        <div className="text-center py-4 text-red-500">
          {error}
        </div>
      )}

      <Tabs defaultValue="upcoming" className="space-y-6">
        {/* Delete confirmation dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={open => setIsDeleteDialogOpen(open)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Are you sure you want to cancel this appointment? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Close</Button>
              <Button className="bg-destructive text-white" onClick={confirmDelete}>Confirm Cancel</Button>
            </div>
          </DialogContent>
        </Dialog>
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
                          <Button variant="outline" size="sm" onClick={() => handleReschedule(appointment)}>
                            <Edit className="mr-1 h-3 w-3" />
                            Reschedule
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAppointmentToDelete(appointment)
                              setIsDeleteDialogOpen(true)
                            }}
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
