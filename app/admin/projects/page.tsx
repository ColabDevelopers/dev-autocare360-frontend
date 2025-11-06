'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
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
      const response = await getAllProjects()
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

  const handleApproveProject = async (projectId: number) => {
    try {
      setUpdating(projectId)
      await approveProject(projectId)
      await fetchProjects() // Refresh the list
      toast({
        title: 'Success',
        description: 'Project approved successfully',
      })
    } catch (error) {
      console.error('Error approving project:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve project',
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

  const filteredProjects = projects.filter(
    project =>
      project.service?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.technician?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <TableHead>Progress</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p>Loading projects...</p>
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <p>No projects found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map(project => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.service}</div>
                        <div className="text-sm text-muted-foreground">
                          {project.estimatedHours || 0}h estimated • {project.actualHours || 0}h actual
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
                              : 'CU'}
                          </AvatarFallback>
                        </Avatar>
                        <span>{project.customerName || 'Unknown Customer'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{project.technician || 'Unassigned'}</TableCell>
                    <TableCell>{getStatusBadge(project.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Progress value={project.progress || 0} className="h-2" />
                        <span className="text-xs text-muted-foreground">{project.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{project.dueDate || 'Not set'}</TableCell>
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
                          <DropdownMenuItem>View Details</DropdownMenuItem>
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
                          <DropdownMenuItem>Assign Employee</DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleUpdateStatus(project.id, 'CANCELLED')}
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
    </div>
  )
}
