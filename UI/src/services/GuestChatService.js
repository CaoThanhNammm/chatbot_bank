/**
 * Guest Chat Service
 * Handles communication with guest chat API (no database storage)
 */

import axios from 'axios';
import { API_CONSTANTS } from '../constants/api';

class GuestChatService {
  constructor() {
    // Create axios instance for guest API
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
        console.log('Guest Chat API Request:', config);
        return config;
      },
      (error) => {
        console.error('Guest Chat API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Setup response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('Guest Chat API Response:', response);
        return response;
      },
      (error) => {
        console.error('Guest Chat API Response Error:', error);
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
      // Extract the actual chat response content
      const chatResponse = data.response || data.message || data.data || '';
      
      return {
        success: data.success,
        response: chatResponse, // Extract the actual chat content
        data: data, // Keep original data for debugging
        error: data.success ? null : (data.message || 'Request failed'),
        status: response.status
      };
    }
    
    // Fallback for successful response
    const chatResponse = data?.response || data?.message || data || '';
    return {
      success: true,
      response: chatResponse, // Extract the actual chat content
      data: data, // Keep original data for debugging
      error: null,
      status: response.status
    };
  }

  /**
   * Handle API errors
   */
  handleError(error) {
    console.error('Guest Chat API Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const data = error.response.data;
      return {
        success: false,
        response: null, // No chat response on error
        data: data, // Keep original error data for debugging
        error: data?.message || data?.error || 'Server error occurred',
        status: error.response.status
      };
    } else if (error.request) {
      // Network error
      return {
        success: false,
        response: null, // No chat response on error
        data: null,
        error: 'Network error - please check your connection',
        status: 0
      };
    } else {
      // Other error
      return {
        success: false,
        response: null, // No chat response on error
        data: null,
        error: error.message || 'An unexpected error occurred',
        status: 500
      };
    }
  }

  /**
   * Send message to guest chat API (no database storage)
   * @param {string} message - The message to send
   * @returns {Promise<Object>} Response object with success, data, error, status
   */
  async sendMessage(message) {
    try {
      const response = await this.axiosInstance.post(
        API_CONSTANTS.ENDPOINTS.CHAT.GUEST_CHAT,
        {
          message: message,
          saveToDb: false // Explicitly indicate not to save to database
        }
      );
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Send message with custom options (no database storage)
   * @param {string} message - The message to send
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Response object
   */
  async sendMessageWithOptions(message, options = {}) {
    try {
      const payload = {
        message: message,
        saveToDb: false, // Explicitly indicate not to save to database
        ...options
      };

      const response = await this.axiosInstance.post(
        API_CONSTANTS.ENDPOINTS.CHAT.GUEST_CHAT,
        payload
      );
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Test connection to guest API
   * @returns {Promise<Object>} Response object
   */
  async testConnection() {
    try {
      const response = await this.sendMessage('test connection');
      return {
        success: true,
        message: 'Guest connection successful',
        data: response
      };
    } catch (error) {
      return {
        success: false,
        message: 'Guest connection failed',
        error: error.message
      };
    }
  }

  /**
   * Send anonymous message (guest mode)
   * @param {string} message - The message to send
   * @returns {Promise<Object>} Response object
   */
  async sendAnonymousMessage(message) {
    try {
      const response = await this.axiosInstance.post(
        API_CONSTANTS.ENDPOINTS.CHAT.GUEST_CHAT,
        {
          message: message,
          anonymous: true,
          saveToDb: false // No database storage for guest messages
        }
      );
      
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Send guest message (legacy method for backward compatibility)
   * @param {string} message - The message to send
   * @param {Function} onChunk - Optional callback for streaming chunks (not supported with axios)
   * @returns {Promise<Object>} Response object
   */
  async sendGuestMessage(message, onChunk = null) {
    // Note: Streaming with onChunk is not supported with axios in this implementation
    // If streaming is needed, consider using fetch or implementing Server-Sent Events
    if (onChunk) {
      console.warn('Streaming with onChunk callback is not supported in axios implementation');
    }
    
    return await this.sendAnonymousMessage(message);
  }
}

// Create and export singleton instance
const guestChatService = new GuestChatService();

// Export both the service instance and the legacy function for backward compatibility
export const sendGuestMessage = guestChatService.sendGuestMessage.bind(guestChatService);
export default guestChatService;