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
  requestedAt: string; // Changed from requestDate to match backend
  completionDate?: string;
  assignedEmployeeId?: number;
  customerId: number;
}

export interface ProjectResponse {
  id: number
  // Main project info (could come from different fields)
  service?: string // Project title in backend (legacy)
  projectName?: string // From project_requests table
  description?: string // From project_requests table
  projectType?: string // From project_requests table
  
  // Vehicle info
  vehicle?: string // Legacy field
  vehicleDetails?: string // From project_requests table
  
  // Status and progress
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  progress?: number
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
  
  // Dates
  date?: string // Legacy
  requestedAt?: string // From project_requests table
  time?: string
  dueDate?: string
  completionDate?: string
  createdAt?: string
  updatedAt?: string
  
  // Assignment info
  assignedEmployeeId?: number // From project_requests table
  assigned_employee_id?: number // Alternative field name
  technician?: string // Legacy field
  technicianId?: number // Legacy field
  
  // Project details
  notes?: string
  specialInstructions?: string // From project_requests table
  estimatedHours?: number
  actualHours?: number
  estimatedCost?: number
  estimatedDurationDays?: number
  
  // Customer info
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
  requestedAt?: string; // Changed from requestDate to match backend
}