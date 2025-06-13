// API configuration and service functions
const API_BASE_URL = 'http://localhost:5000/api';

// API response wrapper
class ApiResponse {
  constructor(data, error = null, status = 200) {
    this.data = data;
    this.error = error;
    this.status = status;
    this.success = !error;
  }
}

// API error handler
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    return new ApiResponse(
      null,
      error.response.data?.message || 'Server error occurred',
      error.response.status
    );
  } else if (error.request) {
    // Network error
    return new ApiResponse(
      null,
      'Network error - please check your connection',
      0
    );
  } else {
    // Other error
    return new ApiResponse(
      null,
      error.message || 'An unexpected error occurred',
      500
    );
  }
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();
    
    if (!response.ok) {
      return new ApiResponse(null, data.message || 'Request failed', response.status);
    }
    
    return new ApiResponse(data, null, response.status);
  } catch (error) {
    return handleApiError(error);
  }
};

// Authentication API
export const authApi = {
  // POST /api/register
  register: async (userData) => {
    return await apiRequest('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // POST /api/login
  login: async (credentials) => {
    const response = await apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Save token if login successful
    if (response.success && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  // POST /api/logout
  logout: async () => {
    const response = await apiRequest('/logout', {
      method: 'POST',
    });
    
    // Clear local storage regardless of response
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('isAuthenticated');
    
    return response;
  },

  // GET /api/profile
  getProfile: async () => {
    return await apiRequest('/profile');
  },

  // PUT /api/profile
  updateProfile: async (profileData) => {
    return await apiRequest('/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Chat API
export const chatApi = {
  // POST /api/chat
  sendMessage: async (message, conversationId = null) => {
    return await apiRequest('/chat', {
      method: 'POST',
      body: JSON.stringify({ 
        message,
        conversation_id: conversationId,
      }),
    });
  },

  // GET /api/conversations
  getConversations: async () => {
    return await apiRequest('/conversations');
  },

  // GET /api/conversations/<id>
  getConversation: async (conversationId) => {
    return await apiRequest(`/conversations/${conversationId}`);
  },

  // DELETE /api/conversations/<id>
  deleteConversation: async (conversationId) => {
    return await apiRequest(`/conversations/${conversationId}`, {
      method: 'DELETE',
    });
  },

  // POST /api/conversations/<id>/clear
  clearConversation: async (conversationId) => {
    return await apiRequest(`/conversations/${conversationId}/clear`, {
      method: 'POST',
    });
  },
};

// Model Management API
export const modelApi = {
  // GET /api/models
  getModels: async () => {
    return await apiRequest('/models');
  },

  // POST /api/models
  createModel: async (modelData) => {
    return await apiRequest('/models', {
      method: 'POST',
      body: JSON.stringify(modelData),
    });
  },

  // GET /api/models/<id>
  getModel: async (modelId) => {
    return await apiRequest(`/models/${modelId}`);
  },

  // PUT /api/models/<id>
  updateModel: async (modelId, modelData) => {
    return await apiRequest(`/models/${modelId}`, {
      method: 'PUT',
      body: JSON.stringify(modelData),
    });
  },

  // DELETE /api/models/<id>
  deleteModel: async (modelId) => {
    return await apiRequest(`/models/${modelId}`, {
      method: 'DELETE',
    });
  },

  // GET /api/models/active
  getActiveModel: async () => {
    return await apiRequest('/models/active');
  },

  // POST /api/models/<id>/activate
  activateModel: async (modelId) => {
    return await apiRequest(`/models/${modelId}/activate`, {
      method: 'POST',
    });
  },
};

// Fine-tuning API
export const fineTuningApi = {
  // GET /api/fine-tuning/jobs
  getJobs: async () => {
    return await apiRequest('/fine-tuning/jobs');
  },

  // POST /api/fine-tuning/jobs
  createJob: async (jobData) => {
    return await apiRequest('/fine-tuning/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  // GET /api/fine-tuning/jobs/<id>
  getJob: async (jobId) => {
    return await apiRequest(`/fine-tuning/jobs/${jobId}`);
  },

  // DELETE /api/fine-tuning/jobs/<id>
  deleteJob: async (jobId) => {
    return await apiRequest(`/fine-tuning/jobs/${jobId}`, {
      method: 'DELETE',
    });
  },

  // POST /api/fine-tuning/jobs/<id>/start
  startJob: async (jobId) => {
    return await apiRequest(`/fine-tuning/jobs/${jobId}/start`, {
      method: 'POST',
    });
  },

  // POST /api/fine-tuning/jobs/<id>/stop
  stopJob: async (jobId) => {
    return await apiRequest(`/fine-tuning/jobs/${jobId}/stop`, {
      method: 'POST',
    });
  },

  // GET /api/fine-tuning/datasets
  getDatasets: async () => {
    return await apiRequest('/fine-tuning/datasets');
  },

  // POST /api/fine-tuning/datasets
  uploadDataset: async (formData) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(`${API_BASE_URL}/fine-tuning/datasets`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData, // FormData for file upload
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return new ApiResponse(null, data.message || 'Upload failed', response.status);
      }
      
      return new ApiResponse(data, null, response.status);
    } catch (error) {
      return handleApiError(error);
    }
  },

  // DELETE /api/fine-tuning/datasets/<id>
  deleteDataset: async (datasetId) => {
    return await apiRequest(`/fine-tuning/datasets/${datasetId}`, {
      method: 'DELETE',
    });
  },
};

// Admin API (User Management)
export const adminApi = {
  // GET /api/admin/users
  getUsers: async () => {
    return await apiRequest('/admin/users');
  },

  // GET /api/admin/users/<id>
  getUser: async (userId) => {
    return await apiRequest(`/admin/users/${userId}`);
  },

  // PUT /api/admin/users/<id>
  updateUser: async (userId, userData) => {
    return await apiRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // DELETE /api/admin/users/<id>
  deleteUser: async (userId) => {
    return await apiRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  },

  // POST /api/admin/users/<id>/activate
  activateUser: async (userId) => {
    return await apiRequest(`/admin/users/${userId}/activate`, {
      method: 'POST',
    });
  },

  // POST /api/admin/users/<id>/deactivate
  deactivateUser: async (userId) => {
    return await apiRequest(`/admin/users/${userId}/deactivate`, {
      method: 'POST',
    });
  },
};

// System API
export const systemApi = {
  // GET /api/system/status
  getStatus: async () => {
    return await apiRequest('/system/status');
  },

  // GET /api/system/health
  getHealth: async () => {
    return await apiRequest('/system/health');
  },
};

// Export default API object with all services
const api = {
  auth: authApi,
  chat: chatApi,
  model: modelApi,
  fineTuning: fineTuningApi,
  admin: adminApi,
  system: systemApi,
};

export default api;
