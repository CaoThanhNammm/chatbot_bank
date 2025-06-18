/**
 * Centralized API Service Class
 * Handles all API communications with consistent error handling and response formatting
 */

import { API_CONSTANTS } from '../constants/api';

class ApiService {
  constructor() {
    // Use constants from centralized config
    this.baseURL = API_CONSTANTS.CONFIG.BASE_URL;
    this.timeout = API_CONSTANTS.CONFIG.TIMEOUT;
    this.endpoints = API_CONSTANTS.ENDPOINTS;
    this.methods = API_CONSTANTS.METHODS;
    this.statusCodes = API_CONSTANTS.STATUS;
    this.storageKeys = API_CONSTANTS.STORAGE_KEYS;
    this.contentTypes = API_CONSTANTS.CONTENT_TYPES;
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem(this.storageKeys.TOKEN);
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Get default headers
   */
  getDefaultHeaders() {
    const headers = {
      'Content-Type': this.contentTypes.JSON,
      ...this.getAuthHeaders()
    };
    
    // Add ngrok headers if using ngrok endpoint
    if (this.baseURL.includes('ngrok')) {
      headers['ngrok-skip-browser-warning'] = 'true';
    }
    
    return headers;
  }

  /**
   * Build full URL
   */
  buildUrl(endpoint) {
    // If endpoint is already an absolute URL, return it as is
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    // Otherwise, combine with base URL
    return `${this.baseURL}${endpoint}`;
  }

  /**
   * Handle API response
   */
  handleResponse(response, data) {
    // Priority check: if data has success field, use that regardless of HTTP status
    if (data && typeof data.success === 'boolean') {
      if (data.success === true) {
        return {
          success: true,
          data: data,
          error: null,
          status: response.status
        };
      } else {
        return {
          success: false,
          data: null,
          error: data.message || 'Request failed',
          status: response.status
        };
      }
    }
    
    // Fallback: Standard HTTP status check
    if (!response.ok) {
      return {
        success: false,
        data: null,
        error: data.message || 'Request failed',
        status: response.status
      };
    }
    
    return {
      success: true,
      data: data,
      error: null,
      status: response.status
    };
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    console.error('API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        data: null,
        error: error.response.data?.message || 'Server error occurred',
        status: error.response.status
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        data: null,
        error: 'Network error - please check your connection',
        status: 0
      };
    } else {
      // Other error
      return {
        success: false,
        data: null,
        error: error.message || 'An unexpected error occurred',
        status: 500
      };
    }
  }

  /**
   * Generic API request method
   */
  async request(endpoint, options = {}) {
    const url = this.buildUrl(endpoint);
    const defaultOptions = {
      method: this.methods.GET,
      headers: this.getDefaultHeaders(),
      ...options
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();
      
      return this.handleResponse(response, data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get(endpoint) {
    return this.request(endpoint, { method: this.methods.GET });
  }

  /**
   * POST request
   */
  async post(endpoint, data = null) {
    const options = {
      method: this.methods.POST,
      body: data ? JSON.stringify(data) : null
    };
    return this.request(endpoint, options);
  }

  /**
   * PUT request
   */
  async put(endpoint, data = null) {
    const options = {
      method: this.methods.PUT,
      body: data ? JSON.stringify(data) : null
    };
    return this.request(endpoint, options);
  }

  /**
   * DELETE request
   */
  async delete(endpoint) {
    return this.request(endpoint, { method: this.methods.DELETE });
  }

  /**
   * File upload request
   */
  async upload(endpoint, formData) {
    const url = this.buildUrl(endpoint);
    
    try {
      const response = await fetch(url, {
        method: this.methods.POST,
        headers: this.getAuthHeaders(), // Don't set Content-Type for FormData
        body: formData
      });
      
      const data = await response.json();
      return this.handleResponse(response, data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // ==================== AUTHENTICATION METHODS ====================

  /**
   * User login
   */
  async login(credentials) {
    const response = await this.post(this.endpoints.AUTH.LOGIN, credentials);
    
    // Save token if login successful
    if (response.success && response.data && response.data.data) {
      localStorage.setItem(this.storageKeys.TOKEN, response.data.data.token);
      localStorage.setItem(this.storageKeys.USER_DATA, JSON.stringify(response.data.data.user));
    }
    
    return response;
  }

  /**
   * User registration
   */
  async register(userData) {
    return this.post(this.endpoints.AUTH.REGISTER, userData);
  }

  /**
   * User logout
   */
  async logout() {
    const response = await this.post(this.endpoints.AUTH.LOGOUT);
    
    // Clear local storage regardless of response
    localStorage.removeItem(this.storageKeys.TOKEN);
    localStorage.removeItem(this.storageKeys.USER_DATA);
    localStorage.removeItem(this.storageKeys.IS_AUTHENTICATED);
    
    return response;
  }

  /**
   * Get user profile
   */
  async getProfile() {
    return this.get(this.endpoints.AUTH.PROFILE);
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    return this.put(this.endpoints.AUTH.UPDATE_PROFILE, profileData);
  }

  /**
   * Change user password
   */
  async changePassword(passwordData) {
    return this.post(this.endpoints.AUTH.CHANGE_PASSWORD, passwordData);
  }

  // ==================== CHAT METHODS ====================

  /**
   * Send chat message
   */
  async sendMessage(message, conversationId = null) {
    return this.post(this.endpoints.CHAT.SEND_MESSAGE, {
      message,
      conversation_id: conversationId
    });
  }

  /**
   * Send simple chat message (new API)
   */
  async sendSimpleMessage(message) {
    const endpoint = this.endpoints.CHAT.SIMPLE_CHAT;
    
    // If using ngrok endpoint, use specialized ngrok service
    if (endpoint.includes('ngrok')) {
      try {
        // Import ngrok service dynamically to avoid circular dependency
        const { default: ngrokChatService } = await import('./NgrokChatService.js');
        const result = await ngrokChatService.sendMessage(message);
        
        // Convert to our standard response format
        return {
          success: result.success,
          data: result.data,
          error: result.error,
          status: result.status || (result.success ? 200 : 500)
        };
      } catch (error) {
        console.error('Ngrok service error:', error);
        return this.handleError(error);
      }
    }
    
    // Default behavior for non-ngrok endpoints
    return this.post(endpoint, { message });
  }

  /**
   * Send message to external chat API (ngrok endpoint)
   */
  async sendExternalMessage(message) {
    // Import external chat service dynamically to avoid circular dependency
    const { default: externalChatService } = await import('./ExternalChatService.js');
    return externalChatService.sendMessage(message);
  }

  /**
   * Create new conversation
   */
  async createConversation(title = "New Conversation", userId = null) {
    const data = { title };
    if (userId) {
      data.user_id = userId;
    }
    return this.post(this.endpoints.CHAT.CONVERSATIONS, data);
  }

  /**
   * Get conversations
   */
  async getConversations(userId = null) {
    const endpoint = userId ? `${this.endpoints.CHAT.CONVERSATIONS}?user_id=${userId}` : this.endpoints.CHAT.CONVERSATIONS;
    const fullUrl = this.buildUrl(endpoint);
    
    console.log('Getting conversations:', {
      userId,
      endpoint,
      fullUrl
    });
    
    const response = await this.get(endpoint);
    console.log('Conversations response:', response);
    
    // Handle the new API response format
    if (response.success && response.data && response.data.conversations) {
      return {
        ...response,
        data: {
          conversations: response.data.conversations
        }
      };
    }
    
    return response;
  }

  /**
   * Get specific conversation
   */
  async getConversation(conversationId) {
    return this.get(this.endpoints.CHAT.CONVERSATION(conversationId));
  }

  /**
   * Add message to conversation
   */
  async addMessageToConversation(conversationId, role, content) {
    return this.post(this.endpoints.CHAT.CONVERSATION_MESSAGES(conversationId), {
      role,
      content
    });
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(conversationId) {
    return this.get(this.endpoints.CHAT.CONVERSATION_MESSAGES(conversationId));
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId) {
    return this.delete(this.endpoints.CHAT.DELETE_CONVERSATION(conversationId));
  }

  /**
   * Clear conversation messages
   */
  async clearConversation(conversationId) {
    return this.post(this.endpoints.CHAT.CLEAR_CONVERSATION(conversationId));
  }

  // ==================== MODEL METHODS ====================

  /**
   * Get all models
   */
  async getModels() {
    return this.get(this.endpoints.MODELS.LIST);
  }

  /**
   * Create new model
   */
  async createModel(modelData) {
    return this.post(this.endpoints.MODELS.CREATE, modelData);
  }

  /**
   * Get specific model
   */
  async getModel(modelId) {
    return this.get(this.endpoints.MODELS.GET(modelId));
  }

  /**
   * Update model
   */
  async updateModel(modelId, modelData) {
    return this.put(this.endpoints.MODELS.UPDATE(modelId), modelData);
  }

  /**
   * Delete model
   */
  async deleteModel(modelId) {
    return this.delete(this.endpoints.MODELS.DELETE(modelId));
  }

  /**
   * Get active model
   */
  async getActiveModel() {
    return this.get(this.endpoints.MODELS.ACTIVE);
  }

  /**
   * Activate model
   */
  async activateModel(modelId) {
    return this.post(this.endpoints.MODELS.ACTIVATE(modelId));
  }

  // ==================== FINE-TUNING METHODS ====================

  /**
   * Get fine-tuning jobs
   */
  async getFineTuningJobs() {
    return this.get(this.endpoints.FINE_TUNING.JOBS);
  }

  /**
   * Create fine-tuning job
   */
  async createFineTuningJob(jobData) {
    return this.post(this.endpoints.FINE_TUNING.CREATE_JOB, jobData);
  }

  /**
   * Get specific fine-tuning job
   */
  async getFineTuningJob(jobId) {
    return this.get(this.endpoints.FINE_TUNING.GET_JOB(jobId));
  }

  /**
   * Delete fine-tuning job
   */
  async deleteFineTuningJob(jobId) {
    return this.delete(this.endpoints.FINE_TUNING.DELETE_JOB(jobId));
  }

  /**
   * Start fine-tuning job
   */
  async startFineTuningJob(jobId) {
    return this.post(this.endpoints.FINE_TUNING.START_JOB(jobId));
  }

  /**
   * Stop fine-tuning job
   */
  async stopFineTuningJob(jobId) {
    return this.post(this.endpoints.FINE_TUNING.STOP_JOB(jobId));
  }

  /**
   * Get datasets
   */
  async getDatasets() {
    return this.get(this.endpoints.FINE_TUNING.DATASETS);
  }

  /**
   * Upload dataset
   */
  async uploadDataset(formData) {
    return this.upload(this.endpoints.FINE_TUNING.UPLOAD_DATASET, formData);
  }

  /**
   * Delete dataset
   */
  async deleteDataset(datasetId) {
    return this.delete(this.endpoints.FINE_TUNING.DELETE_DATASET(datasetId));
  }

  // ==================== ADMIN METHODS ====================

  /**
   * Get all users (admin only)
   */
  async getUsers() {
    return this.get(this.endpoints.ADMIN.USERS);
  }

  /**
   * Get specific user (admin only)
   */
  async getUser(userId) {
    return this.get(this.endpoints.ADMIN.GET_USER(userId));
  }

  /**
   * Update user (admin only)
   */
  async updateUser(userId, userData) {
    return this.put(this.endpoints.ADMIN.UPDATE_USER(userId), userData);
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId) {
    return this.delete(this.endpoints.ADMIN.DELETE_USER(userId));
  }

  /**
   * Activate user (admin only)
   */
  async activateUser(userId) {
    return this.post(this.endpoints.ADMIN.ACTIVATE_USER(userId));
  }

  /**
   * Deactivate user (admin only)
   */
  async deactivateUser(userId) {
    return this.post(this.endpoints.ADMIN.DEACTIVATE_USER(userId));
  }

  // ==================== SYSTEM METHODS ====================

  /**
   * Get system status
   */
  async getSystemStatus() {
    return this.get(this.endpoints.SYSTEM.STATUS);
  }

  /**
   * Get system health
   */
  async getSystemHealth() {
    return this.get(this.endpoints.SYSTEM.HEALTH);
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;