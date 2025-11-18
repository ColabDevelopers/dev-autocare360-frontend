'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Clock, CheckCircle, AlertCircle, Calendar, User, Wrench, FileText, XCircle, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useServiceProgress } from '@/hooks/use-service-progress'
import { toast } from '@/hooks/use-toast'

interface CustomerService {
  id: number
  service: string
  vehicle: string
  status: string
  progress: number
  date: string | null
  time: string | null
  dueDate: string | null
  createdAt: string | null
  updatedAt: string | null
  notes: string | null
  specialInstructions: string | null
  technician: string | null
  technicianId: number | null
  estimatedHours: number | null
  actualHours: number | null
  customerId: number | null
  customerName: string | null
  customerEmail: string | null
}

interface ServiceResponse {
  userId: number | null
  totalServices: number
  allServices: CustomerService[]
  categorized: {
    SCHEDULED: CustomerService[]
    IN_PROGRESS: CustomerService[]
    COMPLETED: CustomerService[]
    CANCELLED: CustomerService[]
  }
  counts: {
    scheduled: number
    inProgress: number
    completed: number
    cancelled: number
  }
}

const getStatusIcon = (status: string) => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return <CheckCircle className="h-4 w-4" />
    case 'IN_PROGRESS':
      return <AlertCircle className="h-4 w-4" />
    case 'SCHEDULED':
    case 'PENDING':
      return <Clock className="h-4 w-4" />
    case 'CANCELLED':
      return <XCircle className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getStatusVariant = (status: string): "default" | "secondary" | "outline" | "destructive" => {
  switch (status.toUpperCase()) {
    case 'COMPLETED':
      return 'default'
    case 'IN_PROGRESS':
      return 'secondary'
    case 'CANCELLED':
      return 'destructive'
    default:
      return 'outline'
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleDateString()
  } catch {
    return dateStr
  }
}

const formatDateTime = (dateStr: string | null) => {
  if (!dateStr) return 'N/A'
  try {
    return new Date(dateStr).toLocaleString()
  } catch {
    return dateStr
  }
}

// Helper function to create toast message
const createToastMessage = (
  service: CustomerService,
  update: { status: string; progress: number; vehicle?: string; service?: string },
  hasStatusChange: boolean,
  hasProgressChange: boolean
): string => {
  const serviceName = update.service || service.service
  const vehicleName = update.vehicle || service.vehicle
  
  let message = `Your ${serviceName} service for ${vehicleName}`
  
  if (hasStatusChange) {
    const status = update.status.toUpperCase()
    switch (status) {
      case 'IN_PROGRESS':
        message += ' is now in progress'
        break
      case 'COMPLETED':
        message += ' has been completed'
        break
      case 'CANCELLED':
        message += ' has been cancelled'
        break
      case 'PENDING':
      case 'SCHEDULED':
        message += ' is scheduled'
        break
      default:
        message += ` status updated to ${update.status}`
    }
    
    if (update.progress !== undefined && update.progress > 0) {
      message += ` (${update.progress}% complete)`
    }
  } else if (hasProgressChange) {
    message += ` - Progress updated to ${update.progress}%`
  }
  
  message += '.'
  
  return message
}

const ServiceCard = ({ service }: { service: CustomerService }) => (
  <Card key={service.id}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl">{service.service}</CardTitle>
          <CardDescription>{service.vehicle}</CardDescription>
        </div>
        <Badge
          variant={getStatusVariant(service.status)}
          className="flex items-center space-x-1"
        >
          {getStatusIcon(service.status)}
          <span>{service.status.replace('_', ' ')}</span>
        </Badge>
      </div>
    </CardHeader>
    <CardContent className="space-y-4">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{service.progress}%</span>
        </div>
        <Progress value={service.progress} className="h-3" />
      </div>

      {/* Service Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
        {service.date && (
          <div className="flex items-start space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Appointment Date</p>
              <p className="font-medium">{formatDate(service.date)}</p>
            </div>
          </div>
        )}
        
        {service.time && (
          <div className="flex items-start space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Time</p>
              <p className="font-medium">{service.time}</p>
            </div>
          </div>
        )}

        {service.technician && (
          <div className="flex items-start space-x-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Technician</p>
              <p className="font-medium">{service.technician}</p>
            </div>
          </div>
        )}

        {service.dueDate && (
          <div className="flex items-start space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Due Date</p>
              <p className="font-medium">{formatDate(service.dueDate)}</p>
            </div>
          </div>
        )}

        {service.estimatedHours !== null && (
          <div className="flex items-start space-x-2">
            <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Estimated Hours</p>
              <p className="font-medium">{service.estimatedHours.toFixed(1)}h</p>
            </div>
          </div>
        )}

        {service.actualHours !== null && (
          <div className="flex items-start space-x-2">
            <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-muted-foreground">Actual Hours</p>
              <p className="font-medium">{service.actualHours.toFixed(1)}h</p>
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      {service.notes && (
        <div className="bg-muted/50 p-3 rounded-lg">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
            <FileText className="h-3 w-3" />
            Notes:
          </p>
          <p className="text-sm">{service.notes}</p>
        </div>
      )}

      {/* Special Instructions */}
      {service.specialInstructions && (
        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-900">
          <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Special Instructions:
          </p>
          <p className="text-sm">{service.specialInstructions}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground pt-2 border-t">
        {service.createdAt && (
          <div>Created: {formatDateTime(service.createdAt)}</div>
        )}
        {service.updatedAt && (
          <div>Updated: {formatDateTime(service.updatedAt)}</div>
        )}
      </div>
    </CardContent>
  </Card>
)

export default function CustomerProgress() {
  const [data, setData] = useState<ServiceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  
  // Real-time service progress updates
  const { latestUpdate, isConnected } = useServiceProgress()

  const fetchServices = async () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return
    }

    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setError('Please login to view your services')
        setLoading(false)
        return
      }

      const response = await fetch('http://localhost:8080/api/customer/services', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.')
        }
        throw new Error(`Failed to fetch services: ${response.statusText}`)
      }

      const result: ServiceResponse = await response.json()
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load services'
      setError(message)
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Only fetch on client side
    if (typeof window !== 'undefined') {
      fetchServices()
    }
  }, [])

  // Handle real-time service progress updates
  useEffect(() => {
    if (latestUpdate && data) {
      console.log('[CustomerProgress] ✅ Processing real-time update:', latestUpdate)
      console.log('[CustomerProgress] Current data:', data)
      
      setData(prevData => {
        if (!prevData) {
          console.log('[CustomerProgress] ⚠️ No previous data')
          return prevData
        }

        // Find the service being updated
        const serviceToUpdate = prevData.allServices.find(s => s.id === latestUpdate.serviceId)
        
        if (!serviceToUpdate) {
          console.log('[CustomerProgress] ⚠️ Service not found:', latestUpdate.serviceId)
          return prevData
        }

        const oldStatus = serviceToUpdate.status.toUpperCase()
        const newStatus = latestUpdate.status.toUpperCase()
        const oldProgress = serviceToUpdate.progress
        const newProgress = latestUpdate.progress
        
        console.log('[CustomerProgress] 🔄 Updating service:', serviceToUpdate.id)
        console.log('[CustomerProgress] Status change:', oldStatus, '→', newStatus)
        console.log('[CustomerProgress] Progress:', oldProgress, '→', newProgress)

        // Show toast notification for the update
        const hasStatusChange = oldStatus !== newStatus
        const hasProgressChange = oldProgress !== newProgress
        
        if (hasStatusChange || hasProgressChange) {
          // Get notification message from backend or create one
          const notificationMessage = latestUpdate.notificationMessage || 
            createToastMessage(serviceToUpdate, latestUpdate, hasStatusChange, hasProgressChange)
          
          // Determine toast variant based on status
          const toastVariant = newStatus === 'COMPLETED' ? 'default' : 
                              newStatus === 'CANCELLED' ? 'destructive' : 
                              'default'
          
          toast({
            title: latestUpdate.notificationTitle || "Service Update",
            description: notificationMessage,
            variant: toastVariant,
          })
          
          console.log('[CustomerProgress] 🔔 Toast notification shown')
        }

        // Create updated service object
        const updatedService: CustomerService = {
          ...serviceToUpdate,
          status: latestUpdate.status,
          progress: latestUpdate.progress,
          updatedAt: new Date().toISOString(),
        }

        // Update allServices array
        const updatedAllServices = prevData.allServices.map(service =>
          service.id === latestUpdate.serviceId ? updatedService : service
        )

        // Recategorize services: Remove from old category, add to new category
        const getCategoryKey = (status: string): keyof ServiceResponse['categorized'] => {
          const upperStatus = status.toUpperCase()
          if (upperStatus === 'PENDING') return 'SCHEDULED'
          if (['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].includes(upperStatus)) {
            return upperStatus as keyof ServiceResponse['categorized']
          }
          return 'SCHEDULED' // default
        }

        const oldCategory = getCategoryKey(oldStatus)
        const newCategory = getCategoryKey(newStatus)

        let updatedCategorized = { ...prevData.categorized }

        // If status changed, move service between categories
        if (oldCategory !== newCategory) {
          console.log('[CustomerProgress] 📦 Moving service from', oldCategory, 'to', newCategory)
          
          // Remove from old category
          updatedCategorized[oldCategory] = updatedCategorized[oldCategory].filter(
            s => s.id !== latestUpdate.serviceId
          )
          
          // Add to new category
          updatedCategorized[newCategory] = [
            ...updatedCategorized[newCategory],
            updatedService
          ]
        } else {
          // Same category, just update the service
          updatedCategorized[newCategory] = updatedCategorized[newCategory].map(service =>
            service.id === latestUpdate.serviceId ? updatedService : service
          )
        }

        // Update counts
        const updatedCounts = {
          scheduled: updatedCategorized.SCHEDULED.length,
          inProgress: updatedCategorized.IN_PROGRESS.length,
          completed: updatedCategorized.COMPLETED.length,
          cancelled: updatedCategorized.CANCELLED.length,
        }

        console.log('[CustomerProgress] ✨ State updated successfully')
        console.log('[CustomerProgress] New counts:', updatedCounts)

        return {
          ...prevData,
          allServices: updatedAllServices,
          categorized: updatedCategorized,
          counts: updatedCounts,
        }
      })
    } else {
      if (!latestUpdate) console.log('[CustomerProgress] No latest update yet')
      if (!data) console.log('[CustomerProgress] No data loaded yet')
    }
  }, [latestUpdate, data])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Loading your services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Error Loading Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button onClick={fetchServices} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data || data.totalServices === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Service Progress</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">No services found</p>
            <p className="text-sm text-muted-foreground mt-2">
              Book an appointment to see your service progress here
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Service Progress</h1>
          <p className="text-muted-foreground mt-1">
            Total Services: {data.totalServices}
          </p>
        </div>
        <Button onClick={fetchServices} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold">{data.counts.scheduled}</p>
              </div>
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{data.counts.inProgress}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{data.counts.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                <p className="text-2xl font-bold">{data.counts.cancelled}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Service View */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({data.totalServices})</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled ({data.counts.scheduled})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({data.counts.inProgress})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({data.counts.completed})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({data.counts.cancelled})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {data.allServices.map(service => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4 mt-6">
          {data.categorized.SCHEDULED.length > 0 ? (
            data.categorized.SCHEDULED.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No scheduled services</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in-progress" className="space-y-4 mt-6">
          {data.categorized.IN_PROGRESS.length > 0 ? (
            data.categorized.IN_PROGRESS.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No services in progress</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {data.categorized.COMPLETED.length > 0 ? (
            data.categorized.COMPLETED.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No completed services</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4 mt-6">
          {data.categorized.CANCELLED.length > 0 ? (
            data.categorized.CANCELLED.map(service => (
              <ServiceCard key={service.id} service={service} />
            ))
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No cancelled services</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
