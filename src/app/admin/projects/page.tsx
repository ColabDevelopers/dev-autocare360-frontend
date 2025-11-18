'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Plus,
  MoreHorizontal,
  FolderOpen,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react'
import { getAllProjects, updateProjectStatus, approveProject } from '@/lib/projects'
import { ProjectResponse } from '@/types/project'
import { useToast } from '@/hooks/use-toast'
import { listEmployees, UserResponse } from '@/services/users'
import { 
  createEmployee, 
  checkEmployeeByEmail, 
  listEmployees as listEmployeesWithDepartments, 
  EmployeeResponse 
} from '@/services/employees'

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [employees, setEmployees] = useState<UserResponse[]>([])
  const [employeesWithDepartments, setEmployeesWithDepartments] = useState<EmployeeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const [selectedProject, setSelectedProject] = useState<ProjectResponse | null>(null)
  const [isViewDetailsOpen, setIsViewDetailsOpen] = useState(false)
  const [isAssignEmployeeOpen, setIsAssignEmployeeOpen] = useState(false)
  const [assignedEmployeeId, setAssignedEmployeeId] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
    fetchEmployees()
    fetchEmployeesWithDepartments()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await getAllProjects()
      
      // Debug: Log the first project's structure to see available fields
      if (response.length > 0) {
        console.log('🔍 First project structure:', {
          keys: Object.keys(response[0]),
          sample: response[0]
        })
      }
      
      // Debug: log assigned fields for each project to help trace assignment mapping
      console.log('📦 Projects fetched (id -> assigned):', response.map((p: any) => ({
        id: p.id,
        assignedEmployeeId: p.assignedEmployeeId ?? p.assigned_employee_id ?? null,
        technician: p.technician ?? null,
        technicianId: p.technicianId ?? null,
        customerName: p.customerName
      })))

      setProjects(response)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await listEmployees()
      setEmployees(response)
    } catch (error) {
      console.error('Error fetching employees:', error)
      // Don't show error toast initially to avoid blocking the UI
      // The assignment will still work if we fetch employees later
    }
  }

  const fetchEmployeesWithDepartments = async () => {
    try {
      const response = await listEmployeesWithDepartments()
      console.log('🏢 Employees with departments received:', response)
      setEmployeesWithDepartments(response)
    } catch (error) {
      console.error('Error fetching employees with departments:', error)
      // Don't show error toast for this as it's additional info
    }
  }

  const handleApproveProject = async (projectId: number) => {
    console.log('🚀 Approving project:', projectId)
    try {
      setUpdating(projectId)
      // Use updateProjectStatus instead of approveProject for more reliable status update
      console.log('📤 Sending approve request...')
      await updateProjectStatus(projectId, { status: 'APPROVED' })
      console.log('✅ Project approved, refreshing list...')
      await fetchProjects() // Refresh the list
      console.log('🔄 Projects list refreshed')
      toast({
        title: 'Success',
        description: 'Project approved successfully! Status changed to Approved.',
      })
    } catch (error) {
      console.error('❌ Error approving project:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve project. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleUpdateStatus = async (projectId: number, status: ProjectResponse['status']) => {
    try {
      setUpdating(projectId)
      await updateProjectStatus(projectId, { status })
      await fetchProjects() // Refresh the list
      toast({
        title: 'Success',
        description: 'Project status updated successfully',
      })
    } catch (error) {
      console.error('Error updating project status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleViewDetails = (project: ProjectResponse) => {
    setSelectedProject(project)
    setIsViewDetailsOpen(true)
  }

  const handleAssignEmployee = (project: ProjectResponse) => {
    console.log('🎬 Opening assign employee dialog for project:', project)
    setSelectedProject(project)
    setIsAssignEmployeeOpen(true)
    
    // Get the current assigned employee ID
    const currentAssignedId = (project as any).assignedEmployeeId || project.technicianId
    setAssignedEmployeeId(currentAssignedId?.toString() || '')
    
    console.log('📋 Current assigned employee ID:', currentAssignedId)
    console.log('💼 Available employees:', employees)
  }

  const handleAssignEmployeeSubmit = async () => {
    console.log('🎯 Starting employee assignment...')
    console.log('📋 Selected project:', selectedProject)
    console.log('👤 Assigned employee ID:', assignedEmployeeId)
    
    if (!selectedProject || !assignedEmployeeId) {
      console.log('❌ Missing data - selectedProject:', selectedProject, 'assignedEmployeeId:', assignedEmployeeId)
      toast({
        title: 'Error',
        description: 'Please select an employee',
        variant: 'destructive',
      })
      return
    }

    try {
      console.log('🚀 Updating project status with employee assignment...')
      setUpdating(selectedProject.id)
      
      // Find the selected employee from the users list or employees list
      const selectedEmployee = employees.find(emp => emp.id === parseInt(assignedEmployeeId)) ||
                              employeesWithDepartments.find(emp => emp.id === parseInt(assignedEmployeeId))
      
      if (selectedEmployee) {
        console.log('👤 Selected employee details:', selectedEmployee)
        
        // Only check/create employee record if we have an email (from users table)
        if ('email' in selectedEmployee) {
          // Check if employee already exists in employees table
          const existingEmployee = await checkEmployeeByEmail(selectedEmployee.email)
          
          if (!existingEmployee) {
            // Create employee record in the employees table
            try {
              console.log('📝 Creating employee record in employees table...')
              await createEmployee({
                name: selectedEmployee.name,
                email: selectedEmployee.email,
                department: 'Service Department' // Default department
              })
              console.log('✅ Employee record created successfully in employees table')
            } catch (employeeError: any) {
              console.warn('⚠️ Failed to create employee record, but continuing with assignment:', employeeError)
            }
          } else {
            console.log('ℹ️ Employee already exists in employees table:', existingEmployee)
          }
        }
      }
      
      const updatePayload = { 
        assignedEmployeeId: parseInt(assignedEmployeeId),
        status: selectedProject.status // Include current status to satisfy backend validation
      }
      console.log('📤 Update payload:', updatePayload)
      
      await updateProjectStatus(selectedProject.id, updatePayload)
      console.log('✅ Project updated successfully')

      // Fetch the updated project details directly to verify backend response
      try {
        const updated = await getProjectDetails(selectedProject.id)
        console.log('📣 Updated project details after assignment:', updated)
      } catch (detErr) {
        console.warn('⚠️ Could not fetch updated project details:', detErr)
      }

      await fetchProjects()
      await fetchEmployeesWithDepartments() // Refresh department info
      await fetchEmployees() // Also refresh users list to ensure lookup works immediately
      console.log('🔄 Projects and departments refreshed')
      
      toast({
        title: 'Success',
        description: `Employee assigned successfully! ${selectedEmployee?.name} can now view this project in their dashboard.`,
      })
      setIsAssignEmployeeOpen(false)
      setSelectedProject(null)
      setAssignedEmployeeId('')
    } catch (error) {
      console.error('❌ Error assigning employee:', error)
      toast({
        title: 'Error',
        description: 'Failed to assign employee',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleCancelProject = async (projectId: number) => {
    try {
      setUpdating(projectId)
      await updateProjectStatus(projectId, { status: 'CANCELLED' })
      await fetchProjects()
      toast({
        title: 'Success',
        description: 'Project cancelled successfully',
      })
    } catch (error) {
      console.error('Error cancelling project:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel project',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const filteredProjects = projects.filter(
    project =>
      (project.service || (project as any).projectName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.vehicle || (project as any).vehicleDetails)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customerName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'APPROVED' || p.status === 'IN_PROGRESS').length
  const inProgressProjects = projects.filter(p => p.status === 'IN_PROGRESS').length
  const completedThisWeek = projects.filter(p => {
    if (p.status !== 'COMPLETED' || !p.updatedAt) return false
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(p.updatedAt) > weekAgo
  }).length
  const overdueProjects = projects.filter(p => {
    if (!p.dueDate || p.status === 'COMPLETED') return false
    return new Date(p.dueDate) < new Date()
  }).length

  const getStatusBadge = (status: ProjectResponse['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default">In Progress</Badge>
      case 'APPROVED':
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusColor = (status: ProjectResponse['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600'
      case 'IN_PROGRESS':
        return 'text-blue-600'
      case 'APPROVED':
        return 'text-purple-600'
      case 'PENDING':
        return 'text-yellow-600'
      case 'CANCELLED':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Helper function to get assigned employee name
  const getAssignedEmployee = (project: ProjectResponse) => {
    // First check if technician info is already available
    if (project.technician) {
      return {
        name: project.technician,
        id: project.technicianId,
        department: 'Service Department' // Default for existing data
      }
    }

    // Check for assignedEmployeeId (from backend response) - try multiple possible field names
    const assignedId = (project as any).assignedEmployeeId || 
                       (project as any).assigned_employee_id || 
                       project.technicianId ||
                       (project as any).assignedEmployee?.id

    if (assignedId) {
      // Normalize assigned id to a number when possible (handles string ids returned by some APIs)
      const employeeId = typeof assignedId === 'string' && assignedId.trim() !== '' ? parseInt(assignedId, 10) : assignedId

      // If it's not a number after normalization, bail out
      if (!employeeId || (typeof employeeId === 'number' && isNaN(employeeId))) return null

      // Try flexible matching: support number or string ids from different APIs
      const matchById = (item: any) => {
        if (item == null) return false
        try {
          return String(item.id) === String(employeeId) || Number(item.id) === Number(employeeId)
        } catch (e) {
          return false
        }
      }

      // First try to find employee in users list
      let employee = employees.find(emp => matchById(emp))

      // If not found in users list, try employees with departments
      if (!employee && employeesWithDepartments.length > 0) {
        const empWithDept = employeesWithDepartments.find(emp => matchById(emp))
        if (empWithDept) {
          return {
            name: empWithDept.name,
            id: empWithDept.id,
            department: empWithDept.department || 'Service Department'
          }
        }
      }

      if (employee) {
        const department = getEmployeeDepartment((employee as any).email)
        return {
          name: employee.name,
          id: employee.id,
          department: department
        }
      }
    }

    return null
  }

  // Helper function to get department for an employee
  const getEmployeeDepartment = (employeeEmail: string): string => {
    const employeeWithDept = employeesWithDepartments.find(emp => emp.email === employeeEmail)
    return employeeWithDept?.department || 'Service Department'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Management</h1>
          <p className="text-muted-foreground">Track and manage complex service projects</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Project
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              {projects.filter(p => p.status === 'PENDING').length} pending approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressProjects}</div>
            <p className="text-xs text-muted-foreground">Currently being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedThisWeek}</div>
            <p className="text-xs text-muted-foreground">From last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueProjects}</div>
            <p className="text-xs text-muted-foreground">Need immediate attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Projects</CardTitle>
          <CardDescription>Manage complex service projects and track progress</CardDescription>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
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
                <TableHead>Project</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Estimate</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Loading projects...</p>
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <p>No projects found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {project.service || 
                           (project as any).projectName || 
                           (project as any).description ||
                           (project as any).projectType ||
                           `Project #${project.id}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {project.vehicle || (project as any).vehicleDetails || 'No vehicle info'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="text-xs">
                            {project.customerName
                              ? project.customerName
                                  .split(' ')
                                  .map((n: string) => n[0])
                                  .join('')
                              : project.customerId?.toString().slice(-2) || 'CU'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{project.customerName || `Customer #${project.customerId || 'Unknown'}`}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const assignedEmployee = getAssignedEmployee(project)
                        if (assignedEmployee) {
                          return (
                            <div>
                              <div className="font-medium">{assignedEmployee.name}</div>
                              <div className="text-xs text-muted-foreground">{assignedEmployee.department}</div>
                            </div>
                          )
                        }
                        return 'Unassigned'
                      })()}
                    </TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {project.estimatedHours ? `${project.estimatedHours} hours` : 'Not estimated'}
                        </div>
                        {project.actualHours && (
                          <div className="text-xs font-medium">{project.actualHours}h actual</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {project.date || (project as any).requestedAt 
                          ? new Date(project.date || (project as any).requestedAt).toLocaleDateString()
                          : 'Not set'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            disabled={updating === project.id}
                          >
                            {updating === project.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreHorizontal className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(project)}>
                            View Details
                          </DropdownMenuItem>
                          {project.status === 'PENDING' && (
                            <DropdownMenuItem onClick={() => handleApproveProject(project.id)}>
                              Approve Project
                            </DropdownMenuItem>
                          )}
                          {project.status === 'APPROVED' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, 'IN_PROGRESS')}>
                              Start Project
                            </DropdownMenuItem>
                          )}
                          {project.status === 'IN_PROGRESS' && (
                            <DropdownMenuItem onClick={() => handleUpdateStatus(project.id, 'COMPLETED')}>
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleAssignEmployee(project)}>
                            Assign Employee
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleCancelProject(project.id)}
                          >
                            Cancel Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Details Dialog */}
      <Dialog open={isViewDetailsOpen} onOpenChange={setIsViewDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
            <DialogDescription>
              Detailed information about the project request.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <div className="p-2 bg-muted rounded">
                    {selectedProject.service || 
                     (selectedProject as any).projectName || 
                     (selectedProject as any).description ||
                     (selectedProject as any).projectType ||
                     `Project #${selectedProject.id}`}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="p-2 bg-muted rounded">
                    {selectedProject.status}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <div className="p-2 bg-muted rounded">
                    {selectedProject.customerName || `Customer #${selectedProject.customerId}`}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle</Label>
                  <div className="p-2 bg-muted rounded">
                    {selectedProject.vehicle || (selectedProject as any).vehicleDetails || 'N/A'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Assigned Technician</Label>
                  <div className="p-2 bg-muted rounded">
                    {(() => {
                      const assignedEmployee = getAssignedEmployee(selectedProject)
                      if (assignedEmployee) {
                        return (
                          <div>
                            <div>{assignedEmployee.name}</div>
                            <div className="text-sm text-muted-foreground">{assignedEmployee.department}</div>
                          </div>
                        )
                      }
                      return 'Unassigned'
                    })()}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Progress</Label>
                  <div className="p-2 bg-muted rounded">
                    {selectedProject.progress || 0}%
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Estimated Hours</Label>
                  <div className="p-2 bg-muted rounded">
                    {selectedProject.estimatedHours || 'Not set'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Requested Date</Label>
                  <div className="p-2 bg-muted rounded">
                    {selectedProject.date || (selectedProject as any).requestedAt 
                      ? new Date(selectedProject.date || (selectedProject as any).requestedAt).toLocaleDateString()
                      : 'Not set'}
                  </div>
                </div>
              </div>
              {((selectedProject as any).description || selectedProject.notes) && (
                <div className="space-y-2">
                  <Label>Description/Notes</Label>
                  <div className="p-3 bg-muted rounded min-h-20">
                    {(selectedProject as any).description || selectedProject.notes || 'No description available'}
                  </div>
                </div>
              )}
              {(selectedProject as any).specialInstructions && (
                <div className="space-y-2">
                  <Label>Special Instructions</Label>
                  <div className="p-3 bg-muted rounded min-h-16">
                    {(selectedProject as any).specialInstructions}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign Employee Dialog */}
      <Dialog open={isAssignEmployeeOpen} onOpenChange={setIsAssignEmployeeOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Assign Employee</DialogTitle>
            <DialogDescription>
              Assign an employee to work on this project.
            </DialogDescription>
          </DialogHeader>
          {selectedProject && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Project</Label>
                <div className="p-2 bg-muted rounded text-sm">
                  {selectedProject.service || 
                   (selectedProject as any).projectName || 
                   (selectedProject as any).description ||
                   (selectedProject as any).projectType ||
                   `Project #${selectedProject.id}`}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee">Select Employee</Label>
                <Select value={assignedEmployeeId} onValueChange={setAssignedEmployeeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Use employees from users table if available, otherwise fall back to employees table */}
                    {(employees.length > 0 ? employees : employeesWithDepartments).map((employee) => (
                      <SelectItem key={employee.id} value={employee.id.toString()}>
                        {employee.name} - {
                          employee.email 
                            ? getEmployeeDepartment(employee.email)
                            : (employee as EmployeeResponse).department || 'Service Department'
                        }
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select the employee you want to assign to this project. This will also add them to the employee database if not already present.
                </p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsAssignEmployeeOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignEmployeeSubmit}
                  disabled={!assignedEmployeeId || updating === selectedProject.id}
                >
                  {updating === selectedProject.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Assign Employee'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
