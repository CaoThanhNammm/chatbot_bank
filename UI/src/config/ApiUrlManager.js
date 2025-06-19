/**
 * API URL Manager
 * Centralized management for all API URLs with different base endpoints
 */

class ApiUrlManager {
  constructor() {
    // Base URLs
    this.NGROK_BASE = 'https://4484-35-237-117-77.ngrok-free.app/api';
    this.LOCALHOST_BASE = 'https://c790-171-247-78-59.ngrok-free.app/api';
    
    // Common headers for ngrok requests - Enhanced CORS bypass
    this.NGROK_HEADERS = {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      // Additional headers to bypass CORS
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://chatbot-bank.vercel.app',
      'Referer': typeof window !== 'undefined' ? window.location.href : 'https://chatbot-bank.vercel.app'
    };
    
    // Common headers for localhost requests - Enhanced CORS bypass
    this.LOCALHOST_HEADERS = {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      // Additional headers to bypass CORS
      'X-Requested-With': 'XMLHttpRequest',
      'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://chatbot-bank.vercel.app',
      'Referer': typeof window !== 'undefined' ? window.location.href : 'https://chatbot-bank.vercel.app'
    };
  }

  /**
   * Get URL for ngrok-based endpoints
   */
  getNgrokUrl(endpoint) {
    return `${this.NGROK_BASE}${endpoint}`;
  }

  /**
   * Get URL for localhost-based endpoints
   */
  getLocalhostUrl(endpoint) {
    return `${this.LOCALHOST_BASE}${endpoint}`;
  }

  /**
   * Get appropriate headers for ngrok requests
   */
  getNgrokHeaders(additionalHeaders = {}) {
    return {
      ...this.NGROK_HEADERS,
      ...additionalHeaders
    };
  }

  /**
   * Get appropriate headers for localhost requests
   */
  getLocalhostHeaders(additionalHeaders = {}) {
    return {
      ...this.LOCALHOST_HEADERS,
      ...additionalHeaders
    };
  }

  // ==================== NGROK ENDPOINTS ====================
  // These endpoints use the ngrok base URL

  /**
   * Load model endpoint
   */
  getLoadModelUrl() {
    return this.getNgrokUrl('/load-model');
  }

  /**
   * Chat endpoint (includes guess and login functionality)
   */
  getChatUrl() {
    return this.getNgrokUrl('/chat');
  }

  /**
   * Guest chat endpoint
   */
  getGuestChatUrl() {
    return this.getNgrokUrl('/chat');
  }

  /**
   * Run fine-tuning task endpoint
   */
  getRunFineTuningTaskUrl() {
    return this.getNgrokUrl('/run_finetuning_task');
  }

  /**
   * Start fine-tuning endpoint
   */
  getStartFineTuningUrl() {
    return this.getNgrokUrl('/start_finetuning');
  }

  /**
   * Get task status endpoint
   */
  getTaskStatusUrl(taskId = null) {
    const endpoint = taskId ? `/get_task_status/${taskId}` : '/get_task_status';
    return this.getNgrokUrl(endpoint);
  }

  /**
   * Get all tasks endpoint
   */
  getAllTasksUrl() {
    return this.getNgrokUrl('/get_all_tasks');
  }

  /**
   * Fine-tuning endpoint (for StaffTrainingPage)
   */
  getFineTuningUrl() {
    return this.getNgrokUrl('/finetune');
  }

  /**
   * Fine-tuning tasks endpoint (for StaffTrainingPage)
   */
  getFineTuningTasksUrl() {
    return this.getNgrokUrl('/finetune/tasks');
  }

  // ==================== LOCALHOST ENDPOINTS ====================
  // These endpoints use the localhost base URL (also ngrok-based)

  /**
   * Authentication endpoints
   */
  getAuthUrls() {
    return {
      login: this.getLocalhostUrl('/auth/login'),
      register: this.getLocalhostUrl('/auth/register'),
      logout: this.getLocalhostUrl('/logout'),
      profile: this.getLocalhostUrl('/auth/me'),
      updateProfile: this.getLocalhostUrl('/profile'),
      changePassword: this.getLocalhostUrl('/auth/change-password'),
      refreshToken: this.getLocalhostUrl('/auth/refresh'),
      forgotPassword: this.getLocalhostUrl('/auth/forgot-password'),
      resetPassword: this.getLocalhostUrl('/auth/reset-password')
    };
  }

  /**
   * Conversation management endpoints
   */
  getConversationUrls() {
    return {
      list: this.getLocalhostUrl('/conversations'),
      create: this.getLocalhostUrl('/conversations'),
      get: (id) => this.getLocalhostUrl(`/conversations/${id}`),
      delete: (id) => this.getLocalhostUrl(`/conversations/${id}`),
      clear: (id) => this.getLocalhostUrl(`/conversations/${id}/clear`),
      messages: (id) => this.getLocalhostUrl(`/conversations/${id}/messages`)
    };
  }

  /**
   * Model management endpoints
   */
  getModelUrls() {
    return {
      list: this.getLocalhostUrl('/models'),
      create: this.getLocalhostUrl('/models'),
      get: (id) => this.getLocalhostUrl(`/models/${id}`),
      update: (id) => this.getLocalhostUrl(`/models/${id}`),
      delete: (id) => this.getLocalhostUrl(`/models/${id}`),
      active: this.getLocalhostUrl('/models/active'),
      activate: (id) => this.getLocalhostUrl(`/models/${id}/activate`),
      deactivate: (id) => this.getLocalhostUrl(`/models/${id}/deactivate`),
      clone: (id) => this.getLocalhostUrl(`/models/${id}/clone`)
    };
  }

  /**
   * Fine-tuning management endpoints (localhost-based)
   */
  getFineTuningManagementUrls() {
    return {
      models: this.getLocalhostUrl('/finetune/models'),
      jobs: this.getLocalhostUrl('/fine-tuning/jobs'),
      createJob: this.getLocalhostUrl('/fine-tuning/jobs'),
      getJob: (id) => this.getLocalhostUrl(`/fine-tuning/jobs/${id}`),
      updateJob: (id) => this.getLocalhostUrl(`/fine-tuning/jobs/${id}`),
      deleteJob: (id) => this.getLocalhostUrl(`/fine-tuning/jobs/${id}`),
      startJob: (id) => this.getLocalhostUrl(`/fine-tuning/jobs/${id}/start`),
      stopJob: (id) => this.getLocalhostUrl(`/fine-tuning/jobs/${id}/stop`),
      pauseJob: (id) => this.getLocalhostUrl(`/fine-tuning/jobs/${id}/pause`),
      resumeJob: (id) => this.getLocalhostUrl(`/fine-tuning/jobs/${id}/resume`),
      jobLogs: (id) => this.getLocalhostUrl(`/fine-tuning/jobs/${id}/logs`),
      
      // Datasets
      datasets: this.getLocalhostUrl('/fine-tuning/datasets'),
      uploadDataset: this.getLocalhostUrl('/fine-tuning/datasets'),
      getDataset: (id) => this.getLocalhostUrl(`/fine-tuning/datasets/${id}`),
      deleteDataset: (id) => this.getLocalhostUrl(`/fine-tuning/datasets/${id}`),
      validateDataset: (id) => this.getLocalhostUrl(`/fine-tuning/datasets/${id}/validate`),
      datasetPreview: (id) => this.getLocalhostUrl(`/fine-tuning/datasets/${id}/preview`)
    };
  }

  /**
   * Admin endpoints
   */
  getAdminUrls() {
    return {
      // User Management
      users: this.getLocalhostUrl('/admin/users'),
      getUser: (id) => this.getLocalhostUrl(`/admin/users/${id}`),
      createUser: this.getLocalhostUrl('/admin/users'),
      updateUser: (id) => this.getLocalhostUrl(`/admin/users/${id}`),
      deleteUser: (id) => this.getLocalhostUrl(`/admin/users/${id}`),
      activateUser: (id) => this.getLocalhostUrl(`/admin/users/${id}/activate`),
      deactivateUser: (id) => this.getLocalhostUrl(`/admin/users/${id}/deactivate`),
      resetUserPassword: (id) => this.getLocalhostUrl(`/admin/users/${id}/reset-password`),
      
      // System Management
      systemSettings: this.getLocalhostUrl('/admin/system/settings'),
      updateSystemSettings: this.getLocalhostUrl('/admin/system/settings'),
      systemLogs: this.getLocalhostUrl('/admin/system/logs'),
      clearSystemLogs: this.getLocalhostUrl('/admin/system/logs/clear'),
      
      // Analytics
      analytics: this.getLocalhostUrl('/admin/analytics'),
      userAnalytics: this.getLocalhostUrl('/admin/analytics/users'),
      chatAnalytics: this.getLocalhostUrl('/admin/analytics/chats'),
      modelAnalytics: this.getLocalhostUrl('/admin/analytics/models')
    };
  }

  /**
   * System endpoints
   */
  getSystemUrls() {
    return {
      status: this.getLocalhostUrl('/system/status'),
      health: this.getLocalhostUrl('/system/health'),
      version: this.getLocalhostUrl('/system/version'),
      metrics: this.getLocalhostUrl('/system/metrics'),
      ping: this.getLocalhostUrl('/system/ping')
    };
  }

  /**
   * File management endpoints
   */
  getFileUrls() {
    return {
      upload: this.getLocalhostUrl('/files/upload'),
      download: (id) => this.getLocalhostUrl(`/files/${id}/download`),
      delete: (id) => this.getLocalhostUrl(`/files/${id}`),
      list: this.getLocalhostUrl('/files'),
      getInfo: (id) => this.getLocalhostUrl(`/files/${id}/info`)
    };
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get all URLs organized by category
   */
  getAllUrls() {
    return {
      // Ngrok-based endpoints
      ngrok: {
        loadModel: this.getLoadModelUrl(),
        chat: this.getChatUrl(),
        guestChat: this.getGuestChatUrl(),
        runFineTuningTask: this.getRunFineTuningTaskUrl(),
        startFineTuning: this.getStartFineTuningUrl(),
        taskStatus: this.getTaskStatusUrl(),
        allTasks: this.getAllTasksUrl(),
        fineTuning: this.getFineTuningUrl(),
        fineTuningTasks: this.getFineTuningTasksUrl()
      },
      
      // Localhost-based endpoints (also using ngrok)
      localhost: {
        auth: this.getAuthUrls(),
        conversations: this.getConversationUrls(),
        models: this.getModelUrls(),
        fineTuningManagement: this.getFineTuningManagementUrls(),
        admin: this.getAdminUrls(),
        system: this.getSystemUrls(),
        files: this.getFileUrls()
      }
    };
  }

  /**
   * Check if an endpoint should use ngrok
   */
  isNgrokEndpoint(endpoint) {
    const ngrokEndpoints = [
      'load-model',
      'chat',
      'run_finetuning_task',
      'start_finetuning',
      'get_task_status',
      'get_all_tasks',
      'finetune'
    ];
    
    return ngrokEndpoints.some(ngrokEndpoint => endpoint.includes(ngrokEndpoint));
  }

  /**
   * Get appropriate URL based on endpoint
   */
  getUrl(endpoint) {
    if (this.isNgrokEndpoint(endpoint)) {
      return this.getNgrokUrl(endpoint);
    } else {
      return this.getLocalhostUrl(endpoint);
    }
  }

  /**
   * Get appropriate headers based on endpoint
   */
  getHeaders(endpoint, additionalHeaders = {}) {
    if (this.isNgrokEndpoint(endpoint)) {
      return this.getNgrokHeaders(additionalHeaders);
    } else {
      return this.getLocalhostHeaders(additionalHeaders);
    }
  }

  /**
   * Get CORS-safe headers for any endpoint
   */
  getCorsHeaders(endpoint, additionalHeaders = {}) {
    const baseHeaders = this.getHeaders(endpoint);
    
    return {
      ...baseHeaders,
      // Force CORS bypass headers
      'Access-Control-Request-Method': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Request-Headers': 'Content-Type, Authorization, X-Requested-With',
      ...additionalHeaders
    };
  }

  /**
   * Update ngrok base URL (useful for dynamic ngrok URLs)
   */
  updateNgrokBase(newNgrokBase) {
    this.NGROK_BASE = newNgrokBase.endsWith('/api') ? newNgrokBase : `${newNgrokBase}/api`;
  }

  /**
   * Update localhost base URL
   */
  updateLocalhostBase(newLocalhostBase) {
    this.LOCALHOST_BASE = newLocalhostBase.endsWith('/api') ? newLocalhostBase : `${newLocalhostBase}/api`;
  }

  /**
   * Get URL with CORS bypass parameters
   * This adds necessary parameters to bypass CORS restrictions
   */
  getProxiedUrl(endpoint) {
    const originalUrl = this.getUrl(endpoint);
    const separator = originalUrl.includes('?') ? '&' : '?';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://chatbot-bank.vercel.app';
    
    return `${originalUrl}${separator}cors_bypass=true&origin=${encodeURIComponent(origin)}&_t=${Date.now()}`;
  }

  /**
   * Make a CORS-safe request with proper headers and error handling
   */
  async makeCorsRequest(url, options = {}) {
    const isNgrok = url.includes('ngrok');
    const headers = isNgrok ? this.getNgrokHeaders() : this.getLocalhostHeaders();
    
    // Merge with provided options
    const requestOptions = {
      mode: 'cors',
      credentials: 'omit', // Avoid credentials for CORS
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    };

    try {
      // First try the original request
      const response = await fetch(url, requestOptions);
      
      if (response.ok) {
        return response;
      }
      
      // If failed, try with proxied URL
      if (response.status === 0 || response.status >= 400) {
        console.warn(`CORS issue detected for ${url}, trying with proxy parameters...`);
        const proxiedUrl = this.getProxiedUrl(url.replace(/\?.*$/, '').replace(this.NGROK_BASE, '').replace(this.LOCALHOST_BASE, ''));
        
        return await fetch(proxiedUrl, {
          ...requestOptions,
          mode: 'no-cors' // Fallback to no-cors mode
        });
      }
      
      return response;
    } catch (error) {
      console.error(`Request failed for ${url}:`, error);
      
      // Try one more time with no-cors mode
      try {
        const proxiedUrl = this.getProxiedUrl(url.replace(/\?.*$/, '').replace(this.NGROK_BASE, '').replace(this.LOCALHOST_BASE, ''));
        return await fetch(proxiedUrl, {
          ...requestOptions,
          mode: 'no-cors'
        });
      } catch (fallbackError) {
        console.error(`Fallback request also failed:`, fallbackError);
        throw error; // Throw original error
      }
    }
  }

  // ==================== CONVENIENCE METHODS ====================
  
  /**
   * Perform GET request with automatic CORS handling
   */
  async get(endpoint, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeCorsRequest(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Perform POST request with automatic CORS handling
   */
  async post(endpoint, data = null, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeCorsRequest(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  /**
   * Perform PUT request with automatic CORS handling
   */
  async put(endpoint, data = null, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeCorsRequest(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  /**
   * Perform DELETE request with automatic CORS handling
   */
  async delete(endpoint, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeCorsRequest(url, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Perform PATCH request with automatic CORS handling
   */
  async patch(endpoint, data = null, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeCorsRequest(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }
}

// Create and export singleton instance
const apiUrlManager = new ApiUrlManager();

export default apiUrlManager;

// Also export the class for direct instantiation if needed
export { ApiUrlManager };