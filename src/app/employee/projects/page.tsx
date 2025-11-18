'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign, 
  Loader2, 
  Play, 
  CheckCircle, 
  FileText,
  AlertCircle,
  FolderOpen
} from 'lucide-react'
import { getEmployeeProjects, updateProjectStatus, startProject, completeProject } from '@/lib/projects'
import { ProjectResponse } from '@/types/project'
import { useToast } from '@/hooks/use-toast'

export default function EmployeeProjects() {
  const [projects, setProjects] = useState<ProjectResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      console.log('🔍 Fetching employee projects...')
      
      // Debug: Check authentication token
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          console.log('🔐 Token payload:', {
            userId: payload.id || payload.userId || payload.sub,
            email: payload.email,
            role: payload.role,
            exp: new Date(payload.exp * 1000),
            fullPayload: payload
          })
        } catch (e) {
          console.log('🔐 Could not decode token payload:', e)
        }
      } else {
        console.log('❌ No authentication token found')
      }
      
      const response = await getEmployeeProjects()
      console.log('📦 Employee projects received:', {
        type: typeof response,
        isArray: Array.isArray(response),
        length: response?.length || 0,
        data: response
      })
      setProjects(response)
      
      // Additional debugging: Try to fetch all projects as fallback
      if (response.length === 0) {
        console.log('🔍 No assigned projects found. Checking if we can access all projects for debugging...')
        try {
          // Import getAllProjects for debugging
          const { getAllProjects } = await import('@/lib/projects')
          const allProjects = await getAllProjects()
          console.log('📊 All projects (for debugging):', {
            total: allProjects.length,
            assignedToEmployee01: allProjects.filter((p: any) => 
              (p as any).assignedEmployeeId === 1 || 
              (p as any).technicianId === 1 ||
              (p as any).technician?.includes('Employee01')
            ),
            projects: allProjects
          })
        } catch (debugError) {
          console.log('🚫 Could not fetch all projects for debugging:', debugError)
        }
      }
      
    } catch (error) {
      console.error('❌ Error fetching projects:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch your projects. Check console for details.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartProject = async (projectId: number) => {
    try {
      setUpdating(projectId)
      await startProject(projectId)
      await fetchProjects()
      toast({
        title: 'Success',
        description: 'Project started successfully',
      })
    } catch (error) {
      console.error('Error starting project:', error)
      toast({
        title: 'Error',
        description: 'Failed to start project',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleCompleteProject = async (projectId: number) => {
    try {
      setUpdating(projectId)
      await completeProject(projectId, 'Project completed by employee')
      await fetchProjects()
      toast({
        title: 'Success',
        description: 'Project completed successfully',
      })
    } catch (error) {
      console.error('Error completing project:', error)
      toast({
        title: 'Error',
        description: 'Failed to complete project',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const handleUpdateProgress = async (projectId: number, progress: number) => {
    try {
      setUpdating(projectId)
      await updateProjectStatus(projectId, { progress })
      await fetchProjects()
      toast({
        title: 'Success',
        description: 'Progress updated successfully',
      })
    } catch (error) {
      console.error('Error updating progress:', error)
      toast({
        title: 'Error',
        description: 'Failed to update progress',
        variant: 'destructive',
      })
    } finally {
      setUpdating(null)
    }
  }

  const getStatusBadge = (status: ProjectResponse['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="default">In Progress</Badge>
      case 'APPROVED':
        return <Badge className="bg-blue-100 text-blue-800">Ready to Start</Badge>
      case 'PENDING':
        return <Badge variant="outline">Pending Approval</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  // Calculate project statistics
  const projectStats = {
    total: projects.length,
    pending: projects.filter(p => p.status === 'APPROVED').length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
    overdue: projects.filter(p => {
      if (!p.dueDate || p.status === 'COMPLETED') return false
      return new Date(p.dueDate) < new Date()
    }).length
  }

  // Removed an accidental/invalid `loading` block that referenced an undefined `status`.

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading your projects...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
          <p className="text-muted-foreground">
            Projects assigned to you ({projectStats.total} total)
          </p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline">
          <Loader2 className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Project Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready to Start</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.pending}</div>
            <p className="text-xs text-muted-foreground">Approved projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Currently working</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{projectStats.overdue}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No projects assigned yet</h3>
              <p className="text-muted-foreground mb-4">
                You don't have any projects assigned to you at the moment. 
                Projects assigned by admin will appear here.
              </p>
              <Button onClick={fetchProjects} variant="outline">
                Check for Updates
              </Button>
            </CardContent>
          </Card>
        ) : (
          projects.map(project => (
            <Card key={project.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {project.service || 
                       (project as any).projectName || 
                       (project as any).description ||
                       `Project #${project.id}`}
                    </CardTitle>
                    <CardDescription className="flex items-center space-x-2 mt-1">
                      <User className="h-4 w-4" />
                      <span>{project.customerName || 'Unknown Customer'}</span>
                      {project.vehicle && (
                        <>
                          <span>•</span>
                          <span>{project.vehicle}</span>
                        </>
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Progress Section */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>

                {/* Project Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-start space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium">
                        {project.dueDate 
                          ? new Date(project.dueDate).toLocaleDateString()
                          : 'Not set'
                        }
                      </p>
                      {project.dueDate && new Date(project.dueDate) < new Date() && project.status !== 'COMPLETED' && (
                        <p className="text-red-600 text-xs">Overdue</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Time Logged</p>
                      <p className="font-medium">{project.actualHours || 0} hours</p>
                      {project.estimatedHours && (
                        <p className="text-xs text-muted-foreground">
                          of {project.estimatedHours} estimated
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Priority</p>
                      <p className="font-medium">
                        {(project as any).priority || 'Normal'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-muted-foreground">Project Type</p>
                      <p className="font-medium">
                        {(project as any).projectType || 
                         (project as any).type || 
                         'Service Project'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description/Notes */}
                {((project as any).description || project.notes || (project as any).specialInstructions) && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Description</p>
                    <div className="p-3 bg-muted rounded text-sm">
                      {(project as any).description || 
                       project.notes || 
                       (project as any).specialInstructions ||
                       'No description provided'}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {project.status === 'APPROVED' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStartProject(project.id)}
                      disabled={updating === project.id}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {updating === project.id ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Play className="h-4 w-4 mr-2" />
                      )}
                      Start Project
                    </Button>
                  )}
                  {project.status === 'IN_PROGRESS' && (
                    <>
                      <Button 
                        size="sm" 
                        onClick={() => handleCompleteProject(project.id)}
                        disabled={updating === project.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updating === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Mark Complete
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateProgress(project.id, Math.min((project.progress || 0) + 10, 100))}
                        disabled={updating === project.id}
                      >
                        Update Progress (+10%)
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Add Notes
                  </Button>
                  {project.status === 'COMPLETED' && (
                    <Badge className="bg-green-100 text-green-800 px-3 py-1">
                      ✅ Project Completed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
