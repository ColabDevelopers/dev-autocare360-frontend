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
  const response = await apiCall('/api/project-requests/assigned', {
    method: 'GET'
  })
  
  if (Array.isArray(response)) {
    return response as ProjectResponse[]
  }
  
  return []
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