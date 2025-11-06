// Project Request Types
export interface ProjectRequest {
  id: number;
  projectName: string;
  projectType: string;
  description: string;
  vehicleDetails: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  estimatedCost?: number;
  estimatedDurationDays?: number;
  specialInstructions?: string;
  requestDate: string;
  completionDate?: string;
  assignedEmployeeId?: number;
  customerId: number;
}

export interface ProjectResponse {
  id: number
  service: string // Project title in backend
  vehicle: string
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  progress: number
  date?: string
  time?: string
  dueDate?: string
  notes?: string
  specialInstructions?: string
  technician?: string
  technicianId?: number
  estimatedHours?: number
  actualHours?: number
  createdAt?: string
  updatedAt?: string
  customerId?: number
  customerName?: string
  customerEmail?: string
}

export interface ProjectStatusUpdate {
  status?: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  progress?: number
  notes?: string
  estimatedHours?: number
  dueDate?: string
  assignedEmployeeId?: number
}

export interface CreateProjectRequest {
  projectName: string;
  projectType: 'MODIFICATION' | 'CUSTOM_WORK' | 'UPGRADE' | 'REPAIR';
  description: string;
  vehicleDetails: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedCost?: number;
  estimatedDurationDays?: number;
  specialInstructions?: string;
}