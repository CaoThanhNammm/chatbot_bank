/**
 * External Chat Service
 * Handles communication with external chat API (ngrok endpoint)
 */

import axios from 'axios';
import { API_CONSTANTS } from '../constants/api';

class ExternalChatService {
  constructor() {
    // Create axios instance for external API
    this.axiosInstance = axios.create({
      baseURL: '',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true' // Skip ngrok browser warning
      }
    });

    // Setup request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('External Chat API Request:', config);
        return config;
      },
      (error) => {
        console.error('External Chat API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Setup response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('External Chat API Response:', response);
        return response;
      },
      (error) => {
        console.error('External Chat API Response Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Handle API response
   */
  handleResponse(response) {
    const data = response.data;
    
    // Check if response has success field
    if (data && typeof data.success === 'boolean') {
      return {
        success: data.success,
        data: data,
        error: data.success ? null : (data.message || 'Request failed'),
        status: response.status
      };
    }
    
    // Fallback for successful response
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
    console.error('External Chat API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const data = error.response.data;
      return {
        success: false,
        data: null,
        error: data?.message || data?.error || 'Server error occurred',
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
   * Send message to external chat API
   * @param {string} message - The message to send
   * @returns {Promise<Object>} Response object with success, data, error, status
   */
  async sendMessage(message) {
    try {
      const response = await this.axiosInstance.post(
        API_CONSTANTS.ENDPOINTS.CHAT.EXTERNAL_CHAT,
        {
          message: message
        }
      );
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Send message with custom options
   * @param {string} message - The message to send
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response object
   */
  async sendMessageWithOptions(message, options = {}) {
    try {
      const payload = {
        message: message,
        ...options
      };

      const response = await this.axiosInstance.post(
        API_CONSTANTS.ENDPOINTS.CHAT.EXTERNAL_CHAT,
        payload
      );
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Test connection to external API
   * @returns {Promise<Object>} Response object
   */
  async testConnection() {
    try {
      const response = await this.sendMessage('test connection');
      return {
        success: true,
        message: 'Connection successful',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: 'Connection failed',
        error: error.message
      };
    }
  }
}

// Create and export singleton instance
const externalChatService = new ExternalChatService();
export default externalChatService;