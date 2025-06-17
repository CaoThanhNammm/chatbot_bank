/**
 * Guest Chat Service
 * Service for handling guest chat API calls
 */

import { CHAT_CONFIG } from '../config/environment';

const API_ENDPOINT = CHAT_CONFIG.GUEST_CHAT_ENDPOINT;

/**
 * Send message to guest chat API
 * @param {string} message - The message to send
 * @returns {Promise<Object>} - API response
 */
export const sendGuestMessage = async (message) => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({
        message: message
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'API returned unsuccessful response');
    }

    return {
      success: true,
      response: data.response
    };
  } catch (error) {
    console.error('Guest chat API error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect to chat service'
    };
  }
};

export default {
  sendGuestMessage
};