'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Calendar, Clock, DollarSign, User, Loader2 } from 'lucide-react'
import { createProjectRequest, getCustomerProjects } from '@/lib/projects'
import { listVehicles } from '@/lib/vehicles'
import type { ProjectRequest, CreateProjectRequest } from '@/types/project'
import type { Vehicle } from '@/types/vehicle'
import { useToast } from '@/hooks/use-toast'

// Form state type
interface ProjectRequestForm {
  title: string;
  vehicle: string;
  description: string;
  budget: string;
  priority: 'low' | 'medium' | 'high';
  projectType: 'MODIFICATION' | 'CUSTOM_WORK' | 'UPGRADE' | 'REPAIR';
}

export default function CustomerProjects() {
  const { toast } = useToast()
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [projects, setProjects] = useState<ProjectRequest[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [projectRequest, setProjectRequest] = useState<ProjectRequestForm>({
    title: '',
    vehicle: '',
    description: '',
    budget: '',
    priority: 'medium',
    projectType: 'MODIFICATION',
  })

  // Load projects and vehicles on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectsData, vehiclesData] = await Promise.all([
          getCustomerProjects(),
          listVehicles()
        ])
        
        console.log('Projects data received:', projectsData)
        setProjects(projectsData || [])
        
        // Debug: Log the vehicles data
        console.log('Vehicles data received:', vehiclesData)
        
        // Handle different response formats from vehicles API
        if (vehiclesData?.items) {
          console.log('Setting vehicles from items:', vehiclesData.items)
          setVehicles(vehiclesData.items)
        } else if (Array.isArray(vehiclesData)) {
          console.log('Setting vehicles from array:', vehiclesData)
          setVehicles(vehiclesData)
        } else {
          console.log('No vehicles found or unexpected format:', vehiclesData)
          setVehicles([])
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        
        // Only show error for vehicles since projects might not be implemented yet
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage && !errorMessage.includes('project')) {
          toast({
            title: "Error",
            description: "Failed to load vehicles",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  const handleRequestProject = async () => {
    if (!projectRequest.title || !projectRequest.vehicle || !projectRequest.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Find selected vehicle ID
    const selectedVehicle = vehicles.find(v => 
      `${v.year} ${v.make} ${v.model}${v.plateNumber ? ` (${v.plateNumber})` : ''}` === projectRequest.vehicle
    )

    if (!selectedVehicle?.id) {
      toast({
        title: "Validation Error",
        description: "Please select a valid vehicle",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {      
      const requestData: CreateProjectRequest = {
        projectName: projectRequest.title.trim(),
        projectType: projectRequest.projectType,
        description: projectRequest.description.trim(),
        vehicleDetails: projectRequest.vehicle,
        priority: projectRequest.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        specialInstructions: `Budget: ${projectRequest.budget || 'Not specified'}`,
      }
      
      console.log('Submitting project request:', requestData)
      
      await createProjectRequest(requestData)

      toast({
        title: "Success",
        description: "Project request submitted successfully! We'll review it shortly.",
      })

      // Reset form and close dialog
      setProjectRequest({
        title: '',
        vehicle: '',
        description: '',
        budget: '',
        priority: 'medium',
        projectType: 'MODIFICATION',
      })
      setIsRequestDialogOpen(false)

      // Refresh projects list
      const updatedProjects = await getCustomerProjects()
      setProjects(updatedProjects || [])
    } catch (error) {
      console.error('Failed to submit project request:', error)
      toast({
        title: "Error",
        description: "Failed to submit project request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'default'
      case 'IN_PROGRESS': return 'secondary'
      case 'APPROVED': return 'outline'
      case 'PENDING': return 'outline'
      default: return 'outline'
    }
  }

  const formatStatus = (status: string) => {
    switch (status) {
      case 'IN_PROGRESS': return 'In Progress'
      case 'COMPLETED': return 'Completed'
      case 'APPROVED': return 'Approved'
      case 'PENDING': return 'Pending'
      case 'CANCELLED': return 'Cancelled'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading projects...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Projects</h1>
        <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Request Project
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Request New Project</DialogTitle>
              <DialogDescription>
                Submit a custom project request for your vehicle modifications or repairs.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  value={projectRequest.title}
                  onChange={e => setProjectRequest({ ...projectRequest, title: e.target.value })}
                  placeholder="e.g., Custom Exhaust System"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Select Vehicle</Label>
                <Select
                  onValueChange={value => setProjectRequest({ ...projectRequest, vehicle: value })}
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loading ? "Loading vehicles..." : "Choose your vehicle"} />
                  </SelectTrigger>
                  <SelectContent>
                    {loading ? (
                      <SelectItem value="" disabled>
                        Loading vehicles...
                      </SelectItem>
                    ) : vehicles.length === 0 ? (
                      <SelectItem value="" disabled>
                        No vehicles registered
                      </SelectItem>
                    ) : (
                      vehicles.map(vehicle => (
                        <SelectItem 
                          key={vehicle.id} 
                          value={`${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.plateNumber ? ` (${vehicle.plateNumber})` : ''}`}
                        >
                          {vehicle.year} {vehicle.make} {vehicle.model}
                          {vehicle.plateNumber && ` (${vehicle.plateNumber})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="projectType">Project Type</Label>
                <Select
                  value={projectRequest.projectType}
                  onValueChange={value => setProjectRequest({ ...projectRequest, projectType: value as ProjectRequestForm['projectType'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MODIFICATION">Modification</SelectItem>
                    <SelectItem value="CUSTOM_WORK">Custom Work</SelectItem>
                    <SelectItem value="UPGRADE">Upgrade</SelectItem>
                    <SelectItem value="REPAIR">Repair</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Project Description</Label>
                <Textarea
                  id="description"
                  value={projectRequest.description}
                  onChange={e =>
                    setProjectRequest({ ...projectRequest, description: e.target.value })
                  }
                  placeholder="Describe your project requirements in detail..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select
                    onValueChange={value => setProjectRequest({ ...projectRequest, budget: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-500">Under $500</SelectItem>
                      <SelectItem value="500-1000">$500 - $1,000</SelectItem>
                      <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                      <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                      <SelectItem value="over-5000">Over $5,000</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    onValueChange={value =>
                      setProjectRequest({ ...projectRequest, priority: value.toLowerCase() as ProjectRequestForm['priority'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestProject} disabled={submitting} className="bg-primary hover:bg-primary/90">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No Project Requests Yet</h3>
              <p className="text-muted-foreground mb-4">
                You haven't submitted any custom project requests. Start by requesting your first project modification.
              </p>
              <Button onClick={() => setIsRequestDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Request Your First Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          projects.map(project => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{project.projectName}</CardTitle>
                    <CardDescription>{project.vehicleDetails}</CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(project.status)}>
                    {formatStatus(project.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Project Type</p>
                    <p className="font-medium">{project.projectType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Priority</p>
                    <Badge variant="outline">{project.priority}</Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Request Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <p className="font-medium">{project.requestDate || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Estimated Cost</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <p className="font-medium">${project.estimatedCost || 'TBD'}</p>
                    </div>
                  </div>
                </div>
                {project.description && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{project.description}</p>
                  </div>
                )}
                {project.specialInstructions && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Special Instructions</p>
                    <p className="text-sm">{project.specialInstructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}