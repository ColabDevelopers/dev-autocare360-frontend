import { apiCall } from './api'
import type { CreateProjectRequest, ProjectRequest, ProjectResponse, ProjectStatusUpdate } from '@/types/project'

// Create a project request using the correct endpoint
export async function createProjectRequest(data: CreateProjectRequest): Promise<ProjectResponse> {
  console.log('🚀 Creating project request with correct format:', data);

  // Build the correct request data format
  const projectRequestData = {
    projectName: data.projectName,
    projectType: data.projectType,
    description: data.description,
    vehicleDetails: data.vehicleDetails,
    ...(data.priority && { priority: data.priority }),
    ...(data.estimatedCost && { estimatedCost: data.estimatedCost }),
    ...(data.estimatedDurationDays && { estimatedDurationDays: data.estimatedDurationDays }),
    ...(data.specialInstructions && { specialInstructions: data.specialInstructions }),
    ...(data.requestedAt && { requestedAt: data.requestedAt }),
  };

  console.log('🚀 Sending corrected project request data:', JSON.stringify(projectRequestData, null, 2));

  try {
    const response = await apiCall('/api/project-requests', {
      method: 'POST',
      body: JSON.stringify(projectRequestData),
    });

    console.log('✅ Project request created successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Project request failed with error:', error);
    throw error;
  }
}

// Update a project request
export async function updateProjectRequest(id: number, data: Partial<CreateProjectRequest>): Promise<ProjectRequest> {
  console.log('🔄 Updating project request:', id, data);

  try {
    const response = await apiCall(`/api/project-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });

    console.log('✅ Project request updated successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Project request update failed:', error);
    throw error;
  }
}

// Delete a project request
export async function deleteProjectRequest(id: number): Promise<void> {
  console.log('🗑️ Deleting project request:', id);

  try {
    await apiCall(`/api/project-requests/${id}`, {
      method: 'DELETE',
    });

    console.log('✅ Project request deleted successfully');
  } catch (error) {
    console.error('❌ Project request deletion failed:', error);
    throw error;
  }
}

// Get customer projects
export async function getCustomerProjects(): Promise<ProjectRequest[]> {
  try {
    const response = await apiCall('/api/project-requests/my-requests', {
      method: 'GET'
    })
    
    // Handle paginated response with items array
    if (response?.items && Array.isArray(response.items)) {
      return response.items as ProjectRequest[]
    }
    
    // Fallback: check if response is directly an array
    if (Array.isArray(response)) {
      console.log('✅ Projects array received directly:', response)
      return response as ProjectRequest[]
    }
    
    console.log('❌ No projects array found in response')
    return []
  } catch (error: any) {
    // If the endpoint doesn't exist (403/404), return empty array for now
    // This allows the UI to work even if no projects exist yet
    if (error.message?.includes('403') || error.message?.includes('404')) {
      console.log('Project requests endpoint not available yet, returning empty array')
      return []
    }
    
    // Re-throw other errors
    throw error
  }
}

// Get all projects (for admin)
export async function getAllProjects(): Promise<ProjectResponse[]> {
  try {
    const response = await apiCall('/api/project-requests', {
      method: 'GET'
    })
    
    console.log('🔍 getAllProjects API response:', response)
    
    if (Array.isArray(response)) {
      return response as ProjectResponse[]
    }
    
    // Handle paginated response
    if (response?.items) {
      return response.items as ProjectResponse[]
    }
    
    return []
  } catch (error: any) {
    // If the endpoint doesn't exist (403/404), return empty array for now
    if (error.message?.includes('403') || error.message?.includes('404')) {
      console.log('Project requests endpoint not available yet, returning empty array')
      return []
    }
    
    // Re-throw other errors
    throw error
  }
}

// Get employee assigned projects
export async function getEmployeeProjects(): Promise<ProjectResponse[]> {
  try {
    console.log('🔍 Fetching employee assigned projects...')
    const response = await apiCall('/api/project-requests/assigned', {
      method: 'GET'
    })
    
    console.log('📦 Employee projects API response:', response)
    
    // Handle array response
    if (Array.isArray(response)) {
      console.log(`✅ Found ${response.length} assigned projects`)
      return response as ProjectResponse[]
    }
    
    // Handle paginated response with items
    if (response?.items && Array.isArray(response.items)) {
      console.log(`✅ Found ${response.items.length} assigned projects in paginated response`)
      return response.items as ProjectResponse[]
    }
    
    // Handle case where response has data property
    if (response?.data && Array.isArray(response.data)) {
      console.log(`✅ Found ${response.data.length} assigned projects in data property`)
      return response.data as ProjectResponse[]
    }
    
    console.log('⚠️ No projects found in response structure')
    return []
  } catch (error: any) {
    console.error('❌ Error fetching employee projects:', error)
    
    // If endpoint doesn't exist yet or user doesn't have access, try fallback
    if (error.message?.includes('403') || error.message?.includes('404') || error.message?.includes('401')) {
      console.log('� Primary endpoint failed, trying fallback approach...')
      return await getEmployeeProjectsFallback()
    }
    
    // Re-throw other errors for proper error handling
    throw error
  }
}

// Fallback method to get employee projects by filtering all projects
export async function getEmployeeProjectsFallback(): Promise<ProjectResponse[]> {
  try {
    console.log('🔄 Using fallback method to get employee projects...')
    
    // Get current user info from token
    let currentUserId: number | null = null
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]))
          currentUserId = payload.id || payload.userId || payload.sub
          console.log('👤 Current user ID from token:', currentUserId)
        } catch (e) {
          console.log('❌ Could not decode token for user ID')
        }
      }
    }
    
    // Get all projects and filter manually
    const allProjects = await getAllProjects()
    console.log('📊 All projects fetched for filtering:', allProjects.length)
    
    // Filter projects assigned to current user
    const assignedProjects = allProjects.filter(project => {
      const isAssigned = 
        (project as any).assignedEmployeeId === currentUserId ||
        project.technicianId === currentUserId ||
        (project as any).assigned_employee_id === currentUserId
      
      if (isAssigned) {
        console.log(`✅ Found assigned project:`, {
          id: project.id,
          service: project.service,
          assignedEmployeeId: (project as any).assignedEmployeeId,
          technicianId: project.technicianId
        })
      }
      
      return isAssigned
    })
    
    console.log(`🎯 Found ${assignedProjects.length} projects assigned to user ${currentUserId}`)
    return assignedProjects
    
  } catch (error) {
    console.error('❌ Fallback method also failed:', error)
    return []
  }
}

// Update project status (admin/employee)
export async function updateProjectStatus(projectId: number, update: ProjectStatusUpdate): Promise<ProjectResponse> {
  const response = await apiCall(`/api/project-requests/${projectId}/status`, {
    method: 'PUT',
    body: JSON.stringify({
      status: update.status,
      progress: update.progress,
      notes: update.notes,
      estimatedHours: update.estimatedHours,
      dueDate: update.dueDate,
      assignedEmployeeId: update.assignedEmployeeId
    })
  })
  
  return response as ProjectResponse
}

// Approve project request (admin)
export async function approveProject(projectId: number, assignedEmployeeId?: number): Promise<ProjectResponse> {
  const response = await apiCall(`/api/project-requests/${projectId}/approve`, {
    method: 'POST',
    body: JSON.stringify({
      assignedEmployeeId
    })
  })
  
  return response as ProjectResponse
}

// Start project work (employee)
export async function startProject(projectId: number): Promise<ProjectResponse> {
  const response = await apiCall(`/api/project-requests/${projectId}/start`, {
    method: 'POST'
  })
  
  return response as ProjectResponse
}

// Complete project (employee)
export async function completeProject(projectId: number, notes?: string): Promise<ProjectResponse> {
  return updateProjectStatus(projectId, {
    status: 'COMPLETED',
    progress: 100,
    notes
  })
}

// Get project details
export async function getProjectDetails(projectId: number): Promise<ProjectResponse> {
  const response = await apiCall(`/api/project-requests/${projectId}`, {
    method: 'GET'
  })
  
  return response as ProjectResponse
}