'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, User, Phone, MessageCircle } from 'lucide-react'
import { apiCall } from '@/lib/api'
import { MessagingDialog } from '@/components/employee/messaging-dialog'

type Appointment = {
  id: number
  service: string
  vehicle: string
  date: string
  time: string
  status: string
  notes?: string
  technician?: string
  user?: {
    id: number
    name: string
    email: string
  }
}

export default function EmployeeAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [messagingDialog, setMessagingDialog] = useState<{
    open: boolean
    customerId: number
    customerName: string
    customerEmail: string
  }>({
    open: false,
    customerId: 0,
    customerName: '',
    customerEmail: ''
  })

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true)
        console.log('🔍 Fetching employee appointments...')
        
        // First, verify we have a valid token and employee role
        const token = localStorage.getItem('accessToken')
        if (!token) {
          throw new Error('No authentication token found. Please log in.')
        }
        
        // Try to decode JWT to check roles (for debugging)
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('JWT Payload:', {
            roles: payload.roles,
            email: payload.email,
            sub: payload.sub
          })
          
          if (!payload.roles || !payload.roles.includes('EMPLOYEE')) {
            throw new Error('Access denied: You must be logged in as an EMPLOYEE to view this page.')
          }
        } catch (decodeErr) {
          console.warn('Could not decode JWT:', decodeErr)
        }
        
        const data = await apiCall('/employee/appointments', { method: 'GET' })
        setAppointments(Array.isArray(data) ? data : [])
        console.log('✅ Employee appointments loaded:', data?.length || 0, 'appointments')
      } catch (err: any) {
        console.error('❌ Error fetching appointments:', err)
        setError(err.message || 'Failed to load appointments')
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [])

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'outline'
      case 'IN_PROGRESS':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const formatStatus = (status: string) => {
    if (!status) return 'Pending'
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ')
  }

  const formatTime = (time: string) => {
    if (!time) return 'N/A'
    // Convert 24h format to 12h format (e.g., "09:00" to "09:00 AM")
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour.toString().padStart(2, '0')}:${minutes} ${ampm}`
  }

  const formatDate = (date: string) => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  const getTodayDate = () => {
    const today = new Date()
    return today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Today's Appointments</h1>
        <p className="text-muted-foreground">Loading appointments...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Today's Appointments</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500 mb-4">Error: {error}</p>
            <p className="text-sm text-muted-foreground">
              {error.includes('404') 
                ? 'The appointments endpoint was not found. This might mean:\n1. You are not logged in as an employee\n2. Your session has expired\n3. The backend server is not running properly'
                : 'Please try refreshing the page or logging in again.'}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
        {appointments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No appointments found for today.</p>
            </CardContent>
          </Card>
        ) : (
          appointments.map(appointment => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{appointment.service}</CardTitle>
                    <CardDescription>{appointment.vehicle}</CardDescription>
                  </div>
                  <Badge variant={getStatusBadgeVariant(appointment.status)}>
                    {formatStatus(appointment.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{appointment.user?.name || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium text-xs">{appointment.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">{formatTime(appointment.time)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium">{formatDate(appointment.date)}</p>
                    </div>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mt-4 p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">Notes:</p>
                    <p className="text-sm">{appointment.notes}</p>
                  </div>
                )}

                <div className="flex space-x-2 mt-4">
                  <Button size="sm">Start Service</Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      if (appointment.user) {
                        setMessagingDialog({
                          open: true,
                          customerId: appointment.user.id,
                          customerName: appointment.user.name,
                          customerEmail: appointment.user.email
                        })
                      }
                    }}
                    disabled={!appointment.user}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact Customer
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Messaging Dialog */}
      <MessagingDialog
        open={messagingDialog.open}
        onOpenChange={(open) => setMessagingDialog(prev => ({ ...prev, open }))}
        customerId={messagingDialog.customerId}
        customerName={messagingDialog.customerName}
        customerEmail={messagingDialog.customerEmail}
      />
    </div>
  )
}
