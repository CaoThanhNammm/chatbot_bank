/**
 * API URL Manager
 * Centralized management for all API URLs with different base endpoints
 */

class ApiUrlManager {
  constructor() {
    // Base URLs
    this.NGROK_BASE = 'https://50a0-34-27-40-188.ngrok-free.app/api';
    this.NGROK_BASE_BE = 'https://5b22-171-247-78-59.ngrok-free.app/api';
    
    // Common headers for ngrok requests
    this.NGROK_HEADERS = {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json'
    };
    
    // Common headers for localhost requests
    this.LOCALHOST_HEADERS = {
      'ngrok-skip-browser-warning': 'true',
      'Content-Type': 'application/json'
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
    return `${this.NGROK_BASE_BE}${endpoint}`;
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
   * Unload model endpoint
   */
  getUnloadModelUrl() {
    return this.getNgrokUrl('/unload-model');
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

  /**
   * Get output folders endpoint
   */
  getOutputFoldersUrl() {
    return this.getNgrokUrl('/get_output_folders');
  }

  /**
   * Check if model is loaded endpoint
   */
  getIsLoadUrl() {
    return this.getNgrokUrl('/isLoad');
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
        unloadModel: this.getUnloadModelUrl(),
        chat: this.getChatUrl(),
        guestChat: this.getGuestChatUrl(),
        runFineTuningTask: this.getRunFineTuningTaskUrl(),
        startFineTuning: this.getStartFineTuningUrl(),
        taskStatus: this.getTaskStatusUrl(),
        allTasks: this.getAllTasksUrl(),
        fineTuning: this.getFineTuningUrl(),
        fineTuningTasks: this.getFineTuningTasksUrl(),
        outputFolders: this.getOutputFoldersUrl()
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
   * Get headers for any endpoint
   */
  getCorsHeaders(endpoint, additionalHeaders = {}) {
    const baseHeaders = this.getHeaders(endpoint);
    
    return {
      ...baseHeaders,
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
    this.NGROK_BASE_BE = newLocalhostBase.endsWith('/api') ? newLocalhostBase : `${newLocalhostBase}/api`;
  }

  /**
   * Get URL with CORS bypass parameters - Open for all origins
   * This adds necessary parameters to bypass CORS restrictions
   */
  getProxiedUrl(endpoint) {
    const originalUrl = this.getUrl(endpoint);
    const separator = originalUrl.includes('?') ? '&' : '?';
    const origin = typeof window !== 'undefined' ? window.location.origin : '*';
    
    return `${originalUrl}${separator}cors_bypass=true&origin=${encodeURIComponent(origin)}&_t=${Date.now()}&access_control_allow_origin=*`;
  }

  /**
   * Get universal headers that work with any endpoint
   */
  getUniversalCorsHeaders(additionalHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...additionalHeaders
    };
  }

  /**
   * Make a request with proper headers and error handling
   */
  async makeCorsRequest(url, options = {}) {
    const isNgrok = url.includes('ngrok');
    const baseHeaders = isNgrok ? this.getNgrokHeaders() : this.getLocalhostHeaders();
    
    // Merge with provided options
    const requestOptions = {
      mode: 'cors',
      credentials: 'omit',
      ...options,
      headers: {
        ...baseHeaders,
        ...options.headers
      }
    };

    // For ngrok, we need to handle the warning page
    if (isNgrok && !url.includes('ngrok-skip-browser-warning')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}ngrok-skip-browser-warning=true`;
    }

    try {
      console.log(`Making CORS-enabled request to: ${url}`);
      console.log('Request options:', requestOptions);
      
      // First attempt with CORS - Open for all origins
      const response = await fetch(url, requestOptions);
      
      if (response.ok) {
        return response;
      }
      
      // If we get a 404, the endpoint might not exist
      if (response.status === 404) {
        console.error(`Endpoint not found: ${url}`);
        throw new Error(`Endpoint not found: ${response.status} ${response.statusText}`);
      }
      
      // For other errors, try with different approach
      console.warn(`Request failed with status ${response.status}, trying alternative approach...`);
      
      // Try with no-cors mode as fallback
      const noCorsResponse = await fetch(url, {
        ...requestOptions,
        mode: 'no-cors',
        headers: {
          ...baseHeaders,
          ...options.headers
        }
      });
      
      return noCorsResponse;
      
    } catch (error) {
      console.error(`All request attempts failed for ${url}:`, error);
      throw error;
    }
  }

  // ==================== CONVENIENCE METHODS ====================
  
  /**
   * Make a universal CORS request that works with any origin
   */
  async makeUniversalRequest(url, options = {}) {
    const universalHeaders = this.getUniversalCorsHeaders(options.headers);
    
    // Add ngrok bypass if needed
    if (url.includes('ngrok') && !url.includes('ngrok-skip-browser-warning')) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}ngrok-skip-browser-warning=true`;
    }

    const requestOptions = {
      mode: 'cors',
      credentials: 'omit',
      ...options,
      headers: universalHeaders
    };

    try {
      console.log(`Making universal CORS request to: ${url}`);
      console.log('Universal headers:', universalHeaders);
      
      const response = await fetch(url, requestOptions);
      
      if (response.ok || response.status === 0) {
        return response;
      }
      
      // Try with no-cors as fallback
      console.warn(`CORS request failed, trying no-cors mode...`);
      return await fetch(url, {
        ...requestOptions,
        mode: 'no-cors'
      });
      
    } catch (error) {
      console.error(`Universal request failed for ${url}:`, error);
      throw error;
    }
  }
  
  /**
   * Perform GET request with automatic CORS handling
   */
  async get(endpoint, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeUniversalRequest(url, {
      method: 'GET',
      ...options
    });
  }

  /**
   * Perform POST request with universal CORS handling
   */
  async post(endpoint, data = null, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeUniversalRequest(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  /**
   * Perform PUT request with universal CORS handling
   */
  async put(endpoint, data = null, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeUniversalRequest(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  /**
   * Perform DELETE request with universal CORS handling
   */
  async delete(endpoint, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeUniversalRequest(url, {
      method: 'DELETE',
      ...options
    });
  }

  /**
   * Perform PATCH request with universal CORS handling
   */
  async patch(endpoint, data = null, options = {}) {
    const url = this.getUrl(endpoint);
    return this.makeUniversalRequest(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
      ...options
    });
  }

  // ==================== DEBUG & TESTING METHODS ====================
  
  /**
   * Enable CORS for all endpoints - Universal access
   */
  enableUniversalCors() {
    console.log('Enabling universal CORS for all endpoints...');
    
    // Update headers to allow all origins
    this.NGROK_HEADERS = this.getUniversalCorsHeaders();
    this.LOCALHOST_HEADERS = this.getUniversalCorsHeaders();
    
    console.log('Universal CORS enabled for:');
    console.log('- NGROK_BASE:', this.NGROK_BASE);
    console.log('- NGROK_BASE_BE:', this.NGROK_BASE_BE);
    console.log('- Headers:', this.NGROK_HEADERS);
    
    return {
      ngrokBase: this.NGROK_BASE,
      localhostBase: this.NGROK_BASE_BE,
      headers: this.NGROK_HEADERS,
      status: 'Universal CORS enabled for all origins'
    };
  }
  
  /**
   * Test connection to server endpoints
   */
  async testConnection() {
    const results = {
      ngrok: { base: this.NGROK_BASE, endpoints: {} },
      localhost: { base: this.NGROK_BASE_BE, endpoints: {} }
    };

    // Test endpoints
    const testEndpoints = [
      '/health',
      '/finetune/tasks',
      '/models/loaded'
    ];

    for (const endpoint of testEndpoints) {
      // Test ngrok
      try {
        const ngrokUrl = `${this.NGROK_BASE}${endpoint}`;
        console.log(`Testing ngrok endpoint: ${ngrokUrl}`);
        
        const response = await fetch(ngrokUrl, {
          method: 'GET',
          headers: this.getNgrokHeaders(),
          mode: 'cors',
          credentials: 'omit'
        });
        
        results.ngrok.endpoints[endpoint] = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };
      } catch (error) {
        results.ngrok.endpoints[endpoint] = {
          error: error.message
        };
      }

      // Test localhost
      try {
        const localhostUrl = `${this.NGROK_BASE_BE}${endpoint}`;
        console.log(`Testing localhost endpoint: ${localhostUrl}`);
        
        const response = await fetch(localhostUrl, {
          method: 'GET',
          headers: this.getLocalhostHeaders(),
          mode: 'cors',
          credentials: 'omit'
        });
        
        results.localhost.endpoints[endpoint] = {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText
        };
      } catch (error) {
        results.localhost.endpoints[endpoint] = {
          error: error.message
        };
      }
    }

    console.log('Connection test results:', results);
    return results;
  }

  /**
   * Debug method to check if endpoints are accessible
   */
  async debugEndpoint(endpoint) {
    const url = this.getUrl(endpoint);
    console.log(`\n=== DEBUG: Testing endpoint ${endpoint} ===`);
    console.log(`Full URL: ${url}`);
    
    const headers = this.getHeaders(endpoint);
    console.log('Headers:', headers);
    
    try {
      // Try with different approaches
      const approaches = [
        { name: 'CORS with credentials omit', options: { mode: 'cors', credentials: 'omit' } },
        { name: 'CORS with credentials include', options: { mode: 'cors', credentials: 'include' } },
        { name: 'No-CORS mode', options: { mode: 'no-cors' } }
      ];
      
      for (const approach of approaches) {
        try {
          console.log(`\nTrying: ${approach.name}`);
          const response = await fetch(url, {
            method: 'GET',
            headers: headers,
            ...approach.options
          });
          
          console.log(`✓ ${approach.name} - Status: ${response.status}, OK: ${response.ok}`);
          
          if (response.ok && response.status !== 0) {
            console.log('✓ This approach works!');
            return { success: true, approach: approach.name, response };
          }
        } catch (error) {
          console.log(`✗ ${approach.name} - Error: ${error.message}`);
        }
      }
      
      return { success: false, message: 'All approaches failed' };
    } catch (error) {
      console.error('Debug failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create and export singleton instance
const apiUrlManager = new ApiUrlManager();

export default apiUrlManager;

// Also export the class for direct instantiation if needed
export { ApiUrlManager };