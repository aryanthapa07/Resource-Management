import api from './api';

export const projectService = {
  // Get all projects with filtering and pagination
  getProjects: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await api.get(`/projects?${queryParams}`);
    return response.data;
  },

  // Get single project by ID
  getProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  // Create new project
  createProject: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  // Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  // Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  // Update project status
  updateProjectStatus: async (projectId, status) => {
    const response = await api.patch(`/projects/${projectId}/status`, { status });
    return response.data;
  },

  // Add team member to project
  addTeamMember: async (projectId, memberData) => {
    const response = await api.post(`/projects/${projectId}/team`, memberData);
    return response.data;
  },

  // Remove team member from project
  removeTeamMember: async (projectId, userId) => {
    const response = await api.delete(`/projects/${projectId}/team/${userId}`);
    return response.data;
  },

  // Add note to project
  addProjectNote: async (projectId, noteData) => {
    const response = await api.post(`/projects/${projectId}/notes`, noteData);
    return response.data;
  },

  // Get project statistics
  getProjectStats: async () => {
    const response = await api.get('/projects/stats');
    return response.data;
  }
};

export default projectService;