'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Calendar, Clock, User, DollarSign, Loader2, Play, CheckCircle } from 'lucide-react'
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
      const response = await getEmployeeProjects()
      setProjects(response)
    } catch (error) {
      console.error('Error fetching projects:', error)
      toast({
        title: 'Error',
        description: 'Failed to fetch your projects',
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
        return <Badge className="bg-blue-100 text-blue-800">Approved</Badge>
      case 'PENDING':
        return <Badge variant="outline">Pending</Badge>
      case 'CANCELLED':
        return <Badge variant="secondary">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

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
        <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
        <Button>Update Progress</Button>
      </div>

      <div className="grid gap-6">
        {projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p>No projects assigned to you yet.</p>
            </CardContent>
          </Card>
        ) : (
          projects.map(project => (
            <Card key={project.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{project.service}</CardTitle>
                    <CardDescription>
                      {project.customerName || 'Unknown Customer'} • {project.vehicle}
                    </CardDescription>
                  </div>
                  {getStatusBadge(project.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{project.progress || 0}%</span>
                  </div>
                  <Progress value={project.progress || 0} className="h-2" />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className="font-medium">{project.dueDate || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Time Logged</p>
                      <p className="font-medium">{project.actualHours || 0} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Estimated Hours</p>
                      <p className="font-medium">{project.estimatedHours || 0} hours</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Customer</p>
                      <p className="font-medium">{project.customerName || 'Unknown'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {project.status === 'APPROVED' && (
                    <Button 
                      size="sm" 
                      onClick={() => handleStartProject(project.id)}
                      disabled={updating === project.id}
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
                      >
                        {updating === project.id ? (
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Complete
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateProgress(project.id, Math.min((project.progress || 0) + 10, 100))}
                        disabled={updating === project.id}
                      >
                        Update Progress
                      </Button>
                    </>
                  )}
                  <Button size="sm" variant="outline">
                    Add Notes
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
