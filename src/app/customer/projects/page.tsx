'use client'

import { useState } from 'react'
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
import { Plus, Calendar, Clock, DollarSign, User } from 'lucide-react'

const projects = [
  {
    id: 1,
    title: 'Custom Exhaust System',
    vehicle: '2020 BMW M3',
    status: 'In Progress',
    progress: 65,
    startDate: '2024-01-15',
    estimatedCompletion: '2024-02-01',
    cost: '$2,500',
    technician: 'Mike Johnson',
  },
  {
    id: 2,
    title: 'Performance Tune',
    vehicle: '2019 Audi RS6',
    status: 'Completed',
    progress: 100,
    startDate: '2024-01-10',
    estimatedCompletion: '2024-01-20',
    cost: '$1,800',
    technician: 'Sarah Wilson',
  },
  {
    id: 3,
    title: 'Suspension Upgrade',
    vehicle: '2021 Porsche 911',
    status: 'Pending',
    progress: 0,
    startDate: '2024-02-05',
    estimatedCompletion: '2024-02-15',
    cost: '$3,200',
    technician: 'Alex Chen',
  },
]

export default function CustomerProjects() {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [projectRequest, setProjectRequest] = useState({
    title: '',
    vehicle: '',
    description: '',
    budget: '',
    priority: '',
  })

  const handleRequestProject = () => {
    console.log('[v0] Project requested:', projectRequest)
    // TODO: Submit project request to backend
    setProjectRequest({
      title: '',
      vehicle: '',
      description: '',
      budget: '',
      priority: '',
    })
    setIsRequestDialogOpen(false)
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
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2020 Toyota Camry">2020 Toyota Camry (ABC-1234)</SelectItem>
                    <SelectItem value="2019 Honda Civic">2019 Honda Civic (XYZ-5678)</SelectItem>
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
                      setProjectRequest({ ...projectRequest, priority: value })
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
              <Button onClick={handleRequestProject} className="bg-primary hover:bg-primary/90">
                Submit Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Start Date</p>
                    <p className="font-medium">{project.startDate}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Est. Completion</p>
                    <p className="font-medium">{project.estimatedCompletion}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Cost</p>
                    <p className="font-medium">{project.cost}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">Technician</p>
                    <p className="font-medium">{project.technician}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
