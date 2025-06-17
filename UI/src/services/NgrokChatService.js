/**
 * Ngrok Chat Service
 * Specialized service for handling ngrok API calls with CORS workarounds
 */

import { CHAT_CONFIG } from '../config/environment.js';

class NgrokChatService {
  constructor() {
    this.endpoint = CHAT_CONFIG.NGROK_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      'Accept': 'application/json'
    };
  }

  /**
   * Send message using different approaches to handle CORS
   */
  async sendMessage(message) {
    console.log('NgrokChatService: Sending message:', message);
    
    // Try multiple approaches
    const approaches = [
      () => this.sendWithFetch(message),
      () => this.sendWithProxy(message),
      () => this.sendWithJsonp(message)
    ];

    for (let i = 0; i < approaches.length; i++) {
      try {
        console.log(`Trying approach ${i + 1}...`);
        const result = await approaches[i]();
        if (result.success) {
          console.log('Success with approach', i + 1);
          return result;
        }
      } catch (error) {
        console.log(`Approach ${i + 1} failed:`, error.message);
        if (i === approaches.length - 1) {
          // Last approach failed, return error
          return {
            success: false,
            data: null,
            error: `All approaches failed. Last error: ${error.message}`,
            status: 0
          };
        }
      }
    }
  }

  /**
   * Approach 1: Standard fetch with CORS
   */
  async sendWithFetch(message) {
    const options = {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ message })
    };

    console.log('Fetch request to:', this.endpoint);
    console.log('Fetch options:', options);

    const response = await fetch(this.endpoint, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
      error: null,
      status: response.status
    };
  }

  /**
   * Approach 2: Use a proxy endpoint (if available)
   */
  async sendWithProxy(message) {
    // Create a proxy endpoint in your local server
    const proxyEndpoint = '/api/proxy/chat';
    
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        message,
        target_url: this.endpoint 
      })
    };

    const response = await fetch(proxyEndpoint, options);
    
    if (!response.ok) {
      throw new Error(`Proxy failed: HTTP ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data,
      error: null,
      status: response.status
    };
  }

  /**
   * Approach 3: JSONP-like approach (if server supports it)
   */
  async sendWithJsonp(message) {
    return new Promise((resolve, reject) => {
      // Create a unique callback name
      const callbackName = `ngrok_callback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create script element
      const script = document.createElement('script');
      
      // Set up callback
      window[callbackName] = (data) => {
        // Clean up
        document.head.removeChild(script);
        delete window[callbackName];
        
        resolve({
          success: true,
          data: data,
          error: null,
          status: 200
        });
      };

      // Handle errors
      script.onerror = () => {
        document.head.removeChild(script);
        delete window[callbackName];
        reject(new Error('JSONP request failed'));
      };

      // Build URL with callback
      const url = `${this.endpoint}?callback=${callbackName}&message=${encodeURIComponent(message)}`;
      script.src = url;
      
      // Add to DOM
      document.head.appendChild(script);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (window[callbackName]) {
          document.head.removeChild(script);
          delete window[callbackName];
          reject(new Error('JSONP request timeout'));
        }
      }, 10000);
    });
  }

  /**
   * Test connection
   */
  async testConnection() {
    try {
      const result = await this.sendMessage('test');
      return {
        success: true,
        message: 'Connection test successful',
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: 'Connection test failed',
        error: error.message
      };
    }
  }
}

// Create and export singleton
const ngrokChatService = new NgrokChatService();
export default ngrokChatService;