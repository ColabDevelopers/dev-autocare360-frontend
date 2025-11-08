"use client"

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Search, Calendar, MoreHorizontal, Clock, CheckCircle, AlertCircle, Plus, Loader2 } from 'lucide-react'
import { apiCall, API_CONFIG } from '@/lib/api'
import { listTechnicians, EmployeeResponse } from '@/services/employees'
import SockJS from 'sockjs-client'
import { Client, IMessage, StompSubscription } from '@stomp/stompjs'

// initially empty, will be fetched from backend
type Appointment = {
  id: number
  user: { id: number; name: string; email: string } | null
  service: string
  vehicle: string
  date: string
  time: string
  status: string
  technician?: string
  avatar?: string
  customerName?: string
  customerEmail?: string
}

const appointmentsInitial: Appointment[] = []

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [appointmentsState, setAppointmentsState] = useState<Appointment[]>(appointmentsInitial)
  const stompClientRef = useRef<Client | null>(null)
  const subscriptionRef = useRef<StompSubscription | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })

  // Schedule appointment dialog state
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false)
  const [isBooking, setIsBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [services, setServices] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<EmployeeResponse[]>([])
  const [techniciansLoading, setTechniciansLoading] = useState(false)
  const [customers, setCustomers] = useState<any[]>([])
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const customerInputRef = useRef<HTMLInputElement>(null)
  const customerDropdownRef = useRef<HTMLDivElement>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [vehiclesLoading, setVehiclesLoading] = useState(false)
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [bookingForm, setBookingForm] = useState({
    customerId: '',
    customerName: '',
    customerEmail: '',
    service: '',
    vehicle: '',
    date: '',
    time: '',
    technician: '',
    notes: '',
    status: 'PENDING'
  })

  // Filter and sort customers by search query (name or email)
  const filteredCustomers = (() => {
    if (!customerSearchQuery) {
      // No search query - return all customers
      return customers
    }
    
    const query = customerSearchQuery.toLowerCase()
    
    // Separate exact matches and partial matches
    const exactMatches: any[] = []
    const partialMatches: any[] = []
    
    customers.forEach(customer => {
      const nameMatch = customer.name.toLowerCase().includes(query)
      const emailMatch = customer.email.toLowerCase().includes(query)
      
      if (nameMatch || emailMatch) {
        // Check if it's an exact match (starts with query)
        const isExactMatch = customer.name.toLowerCase().startsWith(query) || 
                            customer.email.toLowerCase().startsWith(query)
        
        if (isExactMatch) {
          exactMatches.push(customer)
        } else {
          partialMatches.push(customer)
        }
      }
    })
    
    // Return exact matches first, then partial matches
    return [...exactMatches, ...partialMatches]
  })()

  // Calculate statistics from appointments
  const getStatistics = () => {
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    const todayAppointments = appointmentsState.filter(a => a.date === today)
    const todayCount = todayAppointments.length
    const todayConfirmed = todayAppointments.filter(a => a.status?.toUpperCase() === 'CONFIRMED').length
    const todayPending = todayAppointments.filter(a => a.status?.toUpperCase() === 'PENDING').length
    
    const inProgress = appointmentsState.filter(a => a.status?.toUpperCase() === 'IN_PROGRESS').length
    
    const completedToday = appointmentsState.filter(a => 
      a.date === today && a.status?.toUpperCase() === 'COMPLETED'
    ).length
    
    const pendingApproval = appointmentsState.filter(a => a.status?.toUpperCase() === 'PENDING').length

    return {
      todayCount,
      todayConfirmed,
      todayPending,
      inProgress,
      completedToday,
      pendingApproval
    }
  }

  const stats = getStatistics()

  useEffect(() => {
    // Fetch initial appointments for admin
    const fetchAppointments = async () => {
      try {
        const data = await apiCall('/admin/appointments', { method: 'GET' })
        if (Array.isArray(data)) {
          // Map to our local shape
          const mapped = data.map((a: any) => ({
            id: a.id,
            user: a.user ?? null,
            service: a.service,
            vehicle: a.vehicle,
            date: a.date,
            time: a.time?.toString?.().substring(0,5) ?? a.time,
            status: a.status,
            technician: a.technician,
            avatar: a.avatar ?? a.user?.avatar ?? '/placeholder.svg',
            customerName: a.user?.name ?? a.customerName ?? '',
            customerEmail: a.user?.email ?? a.customerEmail ?? '',
          }))
          setAppointmentsState(mapped)
        }
      } catch (e) {
        console.error('Failed to load admin appointments', e)
      }
    }

    fetchAppointments()

    // Connect to websocket for admin real-time updates
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null
    const socket = new SockJS(`${apiUrl}/ws`)
    const client = new Client({
      webSocketFactory: () => socket as any,
      connectHeaders: { Authorization: token ? `Bearer ${token}` : '' },
      debug: (str) => console.log('STOMP:', str),
      onConnect: () => {
        console.log('Admin websocket connected')
        subscriptionRef.current = client.subscribe('/topic/admin-appointments', (msg: IMessage) => {
          try {
            const body = JSON.parse(msg.body)
            console.log('Admin received appointment update:', body)
            setAppointmentsState(prev => {
              // Check if appointment already exists
              const existingIndex = prev.findIndex(a => a.id === body.id)
              
              const updatedAppointment = {
                id: body.id,
                user: body.user ?? null,
                service: body.service,
                vehicle: body.vehicle,
                date: body.date,
                time: body.time?.toString?.().substring(0,5) ?? body.time,
                status: body.status,
                technician: body.technician,
                avatar: body.avatar ?? body.user?.avatar ?? '/placeholder.svg',
                customerName: body.user?.name ?? body.customerName ?? '',
                customerEmail: body.user?.email ?? body.customerEmail ?? '',
              }
              
              if (existingIndex >= 0) {
                // Update existing appointment
                const newState = [...prev]
                newState[existingIndex] = updatedAppointment
                return newState
              } else {
                // Add new appointment
                return [updatedAppointment, ...prev]
              }
            })
          } catch (err) {
            console.error('Failed to parse admin appointment message', err)
          }
        })
      },
      onStompError: (frame) => console.error('STOMP error', frame),
    })
    client.activate()
    stompClientRef.current = client

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null)
      }
      // Close customer dropdown when clicking outside both input and dropdown
      const clickedInsideInput = customerInputRef.current?.contains(event.target as Node)
      const clickedInsideDropdown = customerDropdownRef.current?.contains(event.target as Node)
      
      if (!clickedInsideInput && !clickedInsideDropdown) {
        setShowCustomerDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      if (subscriptionRef.current) subscriptionRef.current.unsubscribe()
      if (stompClientRef.current) stompClientRef.current.deactivate()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        console.log('🔍 Fetching services from database...')
        const data = await apiCall(API_CONFIG.ENDPOINTS.SERVICES, { method: 'GET' })
        // Backend returns { items: [...], total: N, page: 1, perPage: N }
        const servicesList = data?.items || data || []
        setServices(Array.isArray(servicesList) ? servicesList : [])
        console.log('Services loaded:', servicesList?.length || 0, 'services')
      } catch (err) {
        console.error('Error fetching services:', err)
      }
    }
    fetchServices()
  }, [])

  // Fetch technicians
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        console.log('🔍 Fetching technicians from database...')
        setTechniciansLoading(true)
        const employees = await listTechnicians()
        setTechnicians(employees)
        console.log('Technicians loaded:', employees?.length || 0, 'technicians')
      } catch (err) {
        console.error('Error fetching technicians:', err)
      } finally {
        setTechniciansLoading(false)
      }
    }
    fetchTechnicians()
  }, [])

  // Fetch customers (users)
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        console.log('🔍 Fetching customers from database...')
        const data = await apiCall(API_CONFIG.ENDPOINTS.USERS, { method: 'GET' })
        setCustomers(Array.isArray(data) ? data : [])
        console.log('Customers loaded:', data?.length || 0, 'customers')
      } catch (err) {
        console.error('Error fetching customers:', err)
      }
    }
    fetchCustomers()
  }, [])

  // Fetch vehicles for a specific customer
  const fetchVehiclesForCustomer = async (customerId: number) => {
    try {
      console.log('Fetching vehicles for customer:', customerId)
      setVehiclesLoading(true)
      const data = await apiCall(`/api/vehicles/user/${customerId}`, { method: 'GET' })
      const vehiclesList = data?.items || data || []
      setVehicles(Array.isArray(vehiclesList) ? vehiclesList : [])
      console.log('Vehicles loaded:', vehiclesList?.length || 0, 'vehicles')
    } catch (err) {
      console.error('Error fetching vehicles:', err)
      setVehicles([])
    } finally {
      setVehiclesLoading(false)
    }
  }

  // Fetch availability
  const fetchAvailability = async (date: Date, technician?: string) => {
    try {
      const formatDateLocal = (d?: Date) => {
        if (!d) return ''
        const y = d.getFullYear()
        const m = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${y}-${m}-${day}`
      }
      const dateStr = formatDateLocal(date)
      const techParam = technician ? `&technician=${encodeURIComponent(technician)}` : ''
      const data = await apiCall(`${API_CONFIG.ENDPOINTS.AVAILABILITY}?date=${dateStr}${techParam}`, { method: 'GET' })
      let times = data.timeSlots || []
      
      // Filter out past times if selected date is today
      const isToday = formatDateLocal(date) === formatDateLocal(new Date())
      if (isToday) {
        const now = new Date()
        const currentHour = now.getHours()
        
        // Show times from next hour onwards (1-hour slots: 00:00, 01:00, 02:00, ...)
        times = times.filter((time: string) => {
          const [hours] = time.split(':').map(Number)
          return hours > currentHour
        })
      }
      
      setAvailableTimes(times)
    } catch (err) {
      console.error('Error fetching availability:', err)
      setAvailableTimes([])
    }
  }

  // Handle schedule appointment
  const handleScheduleAppointment = async () => {
    if (!bookingForm.service || !bookingForm.vehicle || !bookingForm.date || !bookingForm.time) {
      alert('Please fill all required fields')
      return
    }
    try {
      setIsBooking(true)
      let normalizedTime = bookingForm.time
      if (normalizedTime && normalizedTime.length === 5) {
        normalizedTime = normalizedTime + ':00'
      }

      const payload = {
        service: services.find(s => s.id === bookingForm.service)?.name || '',
        vehicle: bookingForm.vehicle,
        date: bookingForm.date,
        time: normalizedTime,
        status: bookingForm.status,
        notes: bookingForm.notes,
        technician: bookingForm.technician || null,
        userId: bookingForm.customerId ? parseInt(bookingForm.customerId) : null,
      }

      await apiCall('/admin/appointments', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      alert('Appointment scheduled successfully')
      setBookingForm({
        customerId: '',
        customerName: '',
        customerEmail: '',
        service: '',
        vehicle: '',
        date: '',
        time: '',
        technician: '',
        notes: '',
        status: 'PENDING'
      })
      setSelectedDate(undefined)
      setCustomerSearchQuery('')
      setShowCustomerDropdown(false)
      setSelectedVehicleId('')
      setVehicles([])
      setIsScheduleDialogOpen(false)
      
      // Refresh appointments
      const data = await apiCall('/admin/appointments', { method: 'GET' })
      if (Array.isArray(data)) {
        const mapped = data.map((a: any) => ({
          id: a.id,
          user: a.user ?? null,
          service: a.service,
          vehicle: a.vehicle,
          date: a.date,
          time: a.time?.toString?.().substring(0,5) ?? a.time,
          status: a.status,
          technician: a.technician,
          avatar: a.avatar ?? a.user?.avatar ?? '/placeholder.svg',
          customerName: a.user?.name ?? a.customerName ?? '',
          customerEmail: a.user?.email ?? a.customerEmail ?? '',
        }))
        setAppointmentsState(mapped)
      }
    } catch (err) {
      alert((err as any)?.message || 'Failed to schedule appointment')
    } finally {
      setIsBooking(false)
    }
  }

  const filteredAppointments = appointmentsState.filter(
    (appointment) =>
      (appointment.user?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.service ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (appointment.vehicle ?? '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    const statusUpper = status?.toUpperCase()
    switch (statusUpper) {
      case 'CONFIRMED':
        return <Badge variant="default">Confirmed</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="secondary">In Progress</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const changeStatus = async (id: number, newStatus: string) => {
    try {
      const payload = { status: newStatus }
      const updated = await apiCall(`/admin/appointments/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
      // Update local state
      setAppointmentsState(prev => prev.map(a => (a.id === id ? { ...a, status: updated.status } : a)))
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Appointment Management</h1>
          <p className="text-muted-foreground">View and manage all customer appointments</p>
        </div>
        <Button onClick={() => setIsScheduleDialogOpen(true)}>
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Appointment
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayCount}</div>
            <p className="text-xs text-muted-foreground">{stats.todayConfirmed} confirmed, {stats.todayPending} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently being serviced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Finished appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApproval}</div>
            <p className="text-xs text-muted-foreground">Require confirmation</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Appointments</CardTitle>
          <CardDescription>Manage customer appointments and scheduling</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={appointment.avatar || '/placeholder.svg'} />
                        <AvatarFallback>
                          {(appointment.customerName ?? appointment.user?.name ?? '')
                            .split(' ')
                            .map((n) => (n ? n[0] : ''))
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{appointment.customerName ?? appointment.user?.name ?? '-'}</div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.customerEmail ?? appointment.user?.email ?? '-'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.service}</TableCell>
                  <TableCell>{appointment.vehicle}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.date}</div>
                      <div className="text-sm text-muted-foreground">{appointment.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.technician ?? appointment.user?.name ?? '-'}</TableCell>
                  <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                  <TableCell>
                    <div className="relative inline-block">
                      <Button 
                        ref={buttonRef}
                        variant="ghost" 
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect()
                          const windowHeight = window.innerHeight
                          const dropdownHeight = 160 // Approximate height of dropdown
                          
                          // Position above if not enough space below
                          const shouldPositionAbove = rect.bottom + dropdownHeight > windowHeight
                          
                          setDropdownPosition({
                            top: shouldPositionAbove ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
                            left: rect.right - 140
                          })
                          console.log('Dropdown button clicked for appointment:', appointment.id)
                          setOpenDropdownId(openDropdownId === appointment.id ? null : appointment.id)
                        }}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                      {openDropdownId === appointment.id && (
                        <div
                          ref={dropdownRef}
                          className="fixed w-36 bg-gray-900 dark:bg-gray-800 rounded-md shadow-xl z-50 border border-gray-700 py-1"
                          style={{
                            top: `${dropdownPosition.top}px`,
                            left: `${dropdownPosition.left}px`
                          }}
                        >
                          <button
                            className="block w-full text-left px-3 py-2 text-xs text-gray-100 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => {
                              changeStatus(appointment.id, 'PENDING')
                              setOpenDropdownId(null)
                            }}
                          >
                            Pending
                          </button>
                          <button
                            className="block w-full text-left px-3 py-2 text-xs text-gray-100 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => {
                              changeStatus(appointment.id, 'CONFIRMED')
                              setOpenDropdownId(null)
                            }}
                          >
                            Confirmed
                          </button>
                          <button
                            className="block w-full text-left px-3 py-2 text-xs text-gray-100 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => {
                              changeStatus(appointment.id, 'IN_PROGRESS')
                              setOpenDropdownId(null)
                            }}
                          >
                            In Progress
                          </button>
                          <button
                            className="block w-full text-left px-3 py-2 text-xs text-gray-100 hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                            onClick={() => {
                              changeStatus(appointment.id, 'COMPLETED')
                              setOpenDropdownId(null)
                            }}
                          >
                            Completed
                          </button>
                        </div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Schedule Appointment Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={(open) => {
        setIsScheduleDialogOpen(open)
        if (!open) {
          // Reset search when dialog closes
          setCustomerSearchQuery('')
          setShowCustomerDropdown(false)
          setSelectedVehicleId('')
          setVehicles([])
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create an appointment for a customer (walk-in, phone booking, or admin entry).
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4 overflow-y-auto flex-1 pr-2">
            <div className="space-y-2">
              <Label>Customer</Label>
              <div className="relative">
                <Input
                  ref={customerInputRef}
                  placeholder="Click to search customer by name or email..."
                  value={customerSearchQuery}
                  onChange={(e) => {
                    setCustomerSearchQuery(e.target.value)
                    // Only show dropdown if already open or if user is typing
                    if (showCustomerDropdown) {
                      setShowCustomerDropdown(true)
                    }
                  }}
                  onClick={() => setShowCustomerDropdown(true)}
                  className="w-full"
                />
                {showCustomerDropdown && filteredCustomers.length > 0 && (
                  <div 
                    ref={customerDropdownRef}
                    className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto"
                  >
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="px-3 py-2 hover:bg-accent cursor-pointer text-sm"
                        onClick={() => {
                          setCustomerSearchQuery(`${customer.name} (${customer.email})`)
                          setBookingForm({
                            ...bookingForm,
                            customerId: customer.id.toString(),
                            customerName: customer.name,
                            customerEmail: customer.email,
                            vehicle: '' // Reset vehicle when customer changes
                          })
                          setSelectedVehicleId('') // Reset selected vehicle ID
                          setShowCustomerDropdown(false)
                          // Fetch vehicles for selected customer
                          fetchVehiclesForCustomer(customer.id)
                        }}
                      >
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </div>
                    ))}
                  </div>
                )}
                {showCustomerDropdown && filteredCustomers.length === 0 && customerSearchQuery && (
                  <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg">
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No customers found
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {customers.length} customer{customers.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Service</Label>
              <Select onValueChange={value => setBookingForm({ ...bookingForm, service: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {services.length === 0 ? (
                    <SelectItem value="no-services" disabled>No services found</SelectItem>
                  ) : (
                    services.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        <div className="flex justify-between w-full">
                          <span>{service.name}</span>
                          <span className="text-muted-foreground ml-4">{service.price}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {services.length} service{services.length !== 1 ? 's' : ''} available
              </p>
            </div>

            <div className="space-y-2">
              <Label>Vehicle Details</Label>
              <Select 
                disabled={!bookingForm.customerId || vehiclesLoading}
                onValueChange={value => {
                  setSelectedVehicleId(value)
                  const vehicle = vehicles.find(v => v.id.toString() === value)
                  const vehicleStr = vehicle 
                    ? `${vehicle.year} ${vehicle.make} ${vehicle.model} (${vehicle.plateNumber})`
                    : value
                  setBookingForm({ ...bookingForm, vehicle: vehicleStr })
                }}
                value={selectedVehicleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !bookingForm.customerId 
                      ? "Select a customer first" 
                      : vehiclesLoading 
                        ? "Loading vehicles..." 
                        : "Choose a vehicle"
                  } />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {vehicles.length === 0 ? (
                    <SelectItem value="no-vehicles" disabled>
                      {vehiclesLoading ? "Loading..." : "No vehicles found"}
                    </SelectItem>
                  ) : (
                    vehicles.map(vehicle => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        <div>
                          <div className="font-medium">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {vehicle.plateNumber} • {vehicle.color}
                          </div>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {bookingForm.customerId 
                  ? `${vehicles.length} vehicle${vehicles.length !== 1 ? 's' : ''} available`
                  : 'Select a customer to view their vehicles'
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label>Assign Technician</Label>
              <Select 
                disabled={techniciansLoading}
                onValueChange={value => {
                  setBookingForm({ ...bookingForm, technician: value })
                  if (bookingForm.date) {
                    const parts = bookingForm.date.split('-')
                    const d = new Date(parseInt(parts[0]), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
                    fetchAvailability(d, value)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={techniciansLoading ? "Loading technicians..." : "Choose a technician"} />
                </SelectTrigger>
                <SelectContent className="max-h-[300px] overflow-y-auto">
                  {techniciansLoading ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : technicians.length === 0 ? (
                    <SelectItem value="no-technicians" disabled>No technicians available</SelectItem>
                  ) : (
                    technicians.map(t => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name} {t.employeeNo ? `(${t.employeeNo})` : ''}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {!techniciansLoading && `${technicians.length} technician${technicians.length !== 1 ? 's' : ''} available`}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select Date</Label>
                <div className="max-h-80 overflow-auto">
                  <CalendarComponent
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
                      if (date) fetchAvailability(date, bookingForm.technician)
                    }}
                    disabled={date => {
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      const checkDate = new Date(date)
                      checkDate.setHours(0, 0, 0, 0)
                      // Allow today and future dates
                      return checkDate < today
                    }}
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
              <Label>Initial Status</Label>
              <Select value={bookingForm.status} onValueChange={value => setBookingForm({ ...bookingForm, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                </SelectContent>
              </Select>
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
          <div className="flex justify-end space-x-2 shrink-0 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleAppointment} disabled={isBooking} className="bg-primary hover:bg-primary/90">
              {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Schedule Appointment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
