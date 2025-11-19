'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { apiCall } from '@/lib/api'
import { useVehicles } from '@/hooks/useVehicles'
import { Loader2 } from 'lucide-react'
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
import { Plus, Calendar, Clock, DollarSign, User } from 'lucide-react'

export default function CustomerProjects() {
  const { toast } = useToast()
  const { vehicles, loading: vehiclesLoading } = useVehicles()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [projectRequest, setProjectRequest] = useState({
    title: '',
    vehicle: '',
    description: '',
    budget: '',
    priority: '',
  })

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await apiCall('/api/projects', { method: 'GET' })
      const projectList = Array.isArray(data) ? data : data?.items || []
      setProjects(projectList)
      // Save to localStorage as backup
      localStorage.setItem('customer_projects', JSON.stringify(projectList))
    } catch (error: any) {
      console.error('Error fetching projects:', error)
      
      // Check if endpoint doesn't exist (404) - load from localStorage
      if (error?.message && error.message.includes('404')) {
        console.log('Projects API not available, using local storage')
        const localProjects = localStorage.getItem('customer_projects')
        if (localProjects) {
          setProjects(JSON.parse(localProjects))
        } else {
          setProjects([])
        }
      } else {
        // Real error - show toast
        toast({
          title: 'Error',
          description: 'Failed to load projects',
          variant: 'destructive',
        })
        setProjects([])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRequestProject = async () => {
    if (!projectRequest.title || !projectRequest.vehicle || !projectRequest.description) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      
      const newProject = {
        id: Date.now(), // Temporary ID
        title: projectRequest.title,
        vehicle: projectRequest.vehicle,
        description: projectRequest.description,
        budget: projectRequest.budget,
        priority: projectRequest.priority || 'medium',
        status: 'Pending',
        progress: 0,
        startDate: new Date().toISOString().split('T')[0],
        estimatedCompletion: '',
        cost: projectRequest.budget === 'under-500' ? 'Under $500' :
              projectRequest.budget === '500-1000' ? '$500 - $1,000' :
              projectRequest.budget === '1000-2500' ? '$1,000 - $2,500' :
              projectRequest.budget === '2500-5000' ? '$2,500 - $5,000' :
              projectRequest.budget === 'over-5000' ? 'Over $5,000' : 'TBD',
        technician: 'TBD',
      }
      
      console.log('Submitting project request:', newProject)
      
      try {
        // Try to submit to backend
        const result = await apiCall('/api/projects', {
          method: 'POST',
          body: JSON.stringify(newProject),
        })
        
        console.log('Project submitted to backend successfully:', result)
        
        // Use backend result if available
        const updatedProjects = [...projects, result]
        setProjects(updatedProjects)
        localStorage.setItem('customer_projects', JSON.stringify(updatedProjects))
        
      } catch (apiError: any) {
        // If backend not available (404), save locally
        if (apiError?.message && apiError.message.includes('404')) {
          console.log('Backend not available, saving project locally')
          const updatedProjects = [...projects, newProject]
          setProjects(updatedProjects)
          localStorage.setItem('customer_projects', JSON.stringify(updatedProjects))
        } else {
          // Real error - rethrow
          throw apiError
        }
      }

      toast({
        title: 'Success',
        description: 'Project request submitted successfully!',
      })

      setProjectRequest({
        title: '',
        vehicle: '',
        description: '',
        budget: '',
        priority: '',
      })
      setIsRequestDialogOpen(false)
      
    } catch (error: any) {
      console.error('Error submitting project:', error)
      const errorMessage = error?.message || 'Failed to submit project request. Please try again.'
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
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
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  value={projectRequest.title}
                  onChange={e => setProjectRequest({ ...projectRequest, title: e.target.value })}
                  placeholder="e.g., Custom Exhaust System"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Select Vehicle *</Label>
                <Select
                  onValueChange={value => setProjectRequest({ ...projectRequest, vehicle: value })}
                  disabled={vehiclesLoading || vehicles.length === 0}
                  value={projectRequest.vehicle}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      vehiclesLoading
                        ? 'Loading vehicles...'
                        : vehicles.length === 0
                          ? 'No vehicles available - Please add a vehicle first'
                          : 'Choose your vehicle'
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(vehicle => {
                      const displayName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`
                      const plateInfo = vehicle.plateNumber ? ` (${vehicle.plateNumber})` : ''
                      return (
                        <SelectItem key={vehicle.id} value={displayName}>
                          {displayName}{plateInfo}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  value={projectRequest.description}
                  onChange={e =>
                    setProjectRequest({ ...projectRequest, description: e.target.value })
                  }
                  placeholder="Describe your project requirements in detail..."
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget Range</Label>
                  <Select
                    onValueChange={value => setProjectRequest({ ...projectRequest, budget: value })}
                    value={projectRequest.budget}
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
                      setProjectRequest({ ...projectRequest, priority: value })
                    }
                    value={projectRequest.priority}
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
              <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleRequestProject} className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <span className="text-muted-foreground">Loading projects...</span>
        </div>
      ) : projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Request a custom project to get started.
            </p>
            <Button onClick={() => setIsRequestDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Request Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {projects.map(project => (
            <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{project.title}</CardTitle>
                  <CardDescription>{project.vehicle}</CardDescription>
                </div>
                <Badge
                  variant={
                    project.status === 'Completed'
                      ? 'default'
                      : project.status === 'In Progress'
                        ? 'secondary'
                        : 'outline'
                  }
                >
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              {project.description && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-1">Project Description:</p>
                  <p className="text-sm text-muted-foreground">{project.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{project.startDate || 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Est. Completion</p>
                    <p className="font-medium">{project.estimatedCompletion || 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Cost</p>
                    <p className="font-medium">{project.cost || 'TBD'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Technician</p>
                    <p className="font-medium">{project.technician || 'TBD'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  )
}
