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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Calendar, Clock, DollarSign, User, Loader2, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { createProjectRequest, getCustomerProjects, updateProjectRequest, deleteProjectRequest } from '@/lib/projects'
import { listVehicles } from '@/lib/vehicles'
import type { ProjectRequest, CreateProjectRequest } from '@/types/project'
import type { Vehicle } from '@/types/vehicle'
import { useToast } from '@/hooks/use-toast'

// Form state type
interface ProjectRequestForm {
  title: string;
  vehicle: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  projectType: 'MODIFICATION' | 'CUSTOM_WORK' | 'UPGRADE' | 'REPAIR';
  requestedAt: string; // Changed from requestDate to match backend
}

export default function CustomerProjects() {
  const { toast } = useToast()
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<ProjectRequest | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectRequest | null>(null)
  const [projects, setProjects] = useState<ProjectRequest[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [projectRequest, setProjectRequest] = useState<ProjectRequestForm>({
    title: '',
    vehicle: '',
    description: '',
    priority: 'medium',
    projectType: 'MODIFICATION',
    requestedAt: new Date().toISOString().split('T')[0], // Default to today
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
      const newProject = await createProjectRequest({
        projectName: projectRequest.title,
        projectType: projectRequest.projectType,
        description: projectRequest.description,
        vehicleDetails: projectRequest.vehicle,
        priority: projectRequest.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        requestedAt: projectRequest.requestedAt,
      })
      
      console.log('✅ Project request submitted successfully:', newProject)

      toast({
        title: "Success",
        description: "Project request submitted successfully! We'll review it shortly.",
      })

      // Reset form and close dialog
      setProjectRequest({
        title: '',
        vehicle: '',
        description: '',
        priority: 'medium',
        projectType: 'MODIFICATION',
        requestedAt: new Date().toISOString().split('T')[0],
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

  const handleEditProject = (project: ProjectRequest) => {
    setSelectedProject(project)
    
    console.log('🔍 Editing project:', {
      priority: project.priority,
      projectType: project.projectType,
      fullProject: project
    })
    
    // Normalize priority to ensure it matches our form options
    let normalizedPriority: 'low' | 'medium' | 'high' = 'medium'
    const priorityLower = project.priority.toLowerCase()
    if (['low', 'medium', 'high', 'urgent'].includes(priorityLower)) {
      normalizedPriority = priorityLower === 'urgent' ? 'high' : priorityLower as 'low' | 'medium' | 'high'
    }
    
    // Populate the form with existing project data
    setProjectRequest({
      title: project.projectName,
      vehicle: project.vehicleDetails,
      description: project.description,
      priority: normalizedPriority,
      projectType: project.projectType as 'MODIFICATION' | 'CUSTOM_WORK' | 'UPGRADE' | 'REPAIR',
      requestedAt: project.requestedAt || new Date().toISOString().split('T')[0],
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProject = async () => {
    if (!selectedProject || !projectRequest.title || !projectRequest.vehicle || !projectRequest.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const requestData: Partial<CreateProjectRequest> = {
        projectName: projectRequest.title.trim(),
        projectType: projectRequest.projectType,
        description: projectRequest.description.trim(),
        vehicleDetails: projectRequest.vehicle,
        priority: projectRequest.priority.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
        requestedAt: projectRequest.requestedAt,
      }

      console.log('🔄 Updating project:', selectedProject.id, 'with data:', requestData)

      const updatedProject = await updateProjectRequest(selectedProject.id, requestData)
      console.log('✅ Project updated successfully:', updatedProject)

      toast({
        title: "Success",
        description: "Project request updated successfully!",
      })

      // Reset form and close dialog
      setProjectRequest({
        title: '',
        vehicle: '',
        description: '',
        priority: 'medium',
        projectType: 'MODIFICATION',
        requestedAt: new Date().toISOString().split('T')[0],
      })
      setSelectedProject(null)
      setIsEditDialogOpen(false)

      // Refresh projects list
      console.log('🔄 Refreshing projects list...')
      const updatedProjects = await getCustomerProjects()
      console.log('✅ Projects refreshed:', updatedProjects)
      setProjects(updatedProjects || [])
    } catch (error) {
      console.error('Failed to update project request:', error)
      toast({
        title: "Error",
        description: "Failed to update project request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteProject = async (projectId: number) => {
    console.log('🗑️ Attempting to delete project request:', projectId);
    
    // Debug: Check current user's token and role
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('🔍 Current user info:', { 
          userId: payload.sub, 
          roles: payload.roles || payload.authorities,
          allPayload: payload, // Show complete token payload for debugging
          exp: payload.exp 
        });
        
        // Log individual role values for easier debugging
        const roles = payload.roles || payload.authorities || [];
        console.log('🎭 User roles breakdown:', roles);
        roles.forEach((role: any, index: number) => {
          console.log(`🎭 Role ${index + 1}:`, typeof role, role);
        });
      } catch (e) {
        console.log('⚠️ Could not parse token for debugging');
      }
    }

    setDeleting(projectId)
    try {
      await deleteProjectRequest(projectId)

      toast({
        title: "Success",
        description: "Project request deleted successfully!",
      })

      // Refresh projects list
      const updatedProjects = await getCustomerProjects()
      setProjects(updatedProjects || [])
    } catch (error) {
      console.error('Failed to delete project request:', error)
      
      // More specific error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Error",
        description: `Failed to delete project request: ${errorMessage}`,
        variant: "destructive",
      })
    } finally {
      setDeleting(null)
      setIsDeleteDialogOpen(false)
      setProjectToDelete(null)
    }
  }

  const handleDeleteClick = (project: ProjectRequest) => {
    setProjectToDelete(project)
    setIsDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      handleDeleteProject(projectToDelete.id)
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
                  <Label htmlFor="requestDate">Request Date</Label>
                  <Input
                    id="requestDate"
                    type="date"
                    value={projectRequest.requestedAt}
                    onChange={e => setProjectRequest({ ...projectRequest, requestedAt: e.target.value })}
                    className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
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

        {/* Edit Project Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Project Request</DialogTitle>
              <DialogDescription>
                Update your project request details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Project Title</Label>
                <Input
                  id="edit-title"
                  value={projectRequest.title}
                  onChange={e => setProjectRequest({ ...projectRequest, title: e.target.value })}
                  placeholder="e.g., Custom Exhaust System"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-vehicle">Select Vehicle</Label>
                <Select
                  key={`vehicle-${selectedProject?.id}`}
                  value={projectRequest.vehicle}
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
                <Label htmlFor="edit-projectType">Project Type</Label>
                <Select
                  key={`projectType-${selectedProject?.id}`}
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
                <Label htmlFor="edit-description">Project Description</Label>
                <Textarea
                  id="edit-description"
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
                  <Label htmlFor="edit-requestDate">Request Date</Label>
                  <Input
                    id="edit-requestDate"
                    type="date"
                    value={projectRequest.requestedAt}
                    onChange={e => setProjectRequest({ ...projectRequest, requestedAt: e.target.value })}
                    className="[&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    key={`priority-${selectedProject?.id}`}
                    value={projectRequest.priority}
                    onValueChange={value =>
                      setProjectRequest({ ...projectRequest, priority: value as ProjectRequestForm['priority'] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProject} disabled={submitting} className="bg-primary hover:bg-primary/90">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Project'
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
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(project.status)}>
                      {formatStatus(project.status)}
                    </Badge>
                    {/* Only show edit/delete actions for PENDING projects */}
                    {project.status === 'PENDING' ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditProject(project)}
                          className="h-8 px-2"
                          title="Edit this project request"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteClick(project)}
                          disabled={deleting === project.id}
                          className="h-8 px-2 text-destructive hover:text-destructive"
                          title="Delete this project request"
                        >
                          {deleting === project.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </>
                    ) : (
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded">
                        {project.status === 'IN_PROGRESS' && 'Work in progress'}
                        {project.status === 'COMPLETED' && 'Project completed'}
                        {project.status === 'APPROVED' && 'Approved - pending start'}
                        {project.status === 'CANCELLED' && 'Cancelled'}
                      </span>
                    )}
                  </div>
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
                      <p className="font-medium">
                        {project.requestedAt 
                          ? new Date(project.requestedAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })
                          : 'Not set'
                        }
                      </p>
                    </div>
                  </div>
                  {(project.estimatedCost || project.estimatedDurationDays) && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Estimate</p>
                      <div className="flex items-center gap-2">
                        {project.estimatedCost && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <p className="font-medium">${project.estimatedCost}</p>
                          </div>
                        )}
                        {project.estimatedDurationDays && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <p className="font-medium">{project.estimatedDurationDays} days</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2 text-destructive">
              
              Delete Project Request
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to delete this project request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setProjectToDelete(null)
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={!!deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}