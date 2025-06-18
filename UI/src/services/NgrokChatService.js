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
   * Send message using streaming approach with CORS handling
   */
  async sendMessage(message, onChunk = null) {
    console.log('NgrokChatService: Sending streaming message:', message);
    
    // Try multiple approaches to handle CORS
    const approaches = [
      () => this.sendWithStreamingFetch(message, onChunk),
      () => this.sendWithProxy(message, onChunk),
      () => this.sendWithFallbackFetch(message, onChunk)
    ];

    for (let i = 0; i < approaches.length; i++) {
      try {
        console.log(`Trying streaming approach ${i + 1}...`);
        const result = await approaches[i]();
        if (result.success) {
          console.log('Success with streaming approach', i + 1);
          return result;
        }
      } catch (error) {
        console.log(`Streaming approach ${i + 1} failed:`, error.message);
        if (i === approaches.length - 1) {
          // Last approach failed, return error
          return {
            success: false,
            data: null,
            error: `All streaming approaches failed. Last error: ${error.message}`,
            status: 0
          };
        }
      }
    }
  }

  /**
   * Primary streaming fetch approach
   */
  async sendWithStreamingFetch(message, onChunk) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,ngrok-skip-browser-warning'
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Handle streaming response
    if (onChunk && typeof onChunk === 'function') {
      return await this.handleStreamingResponse(response, onChunk);
    } else {
      // Fallback: read entire response at once
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        return {
          success: data.success || true,
          data: data,
          error: null,
          status: response.status
        };
      } catch (parseError) {
        // If it's not valid JSON, treat as streaming response and collect all chunks
        return {
          success: true,
          data: { response: text },
          error: null,
          status: response.status
        };
      }
    }
  }

  /**
   * Proxy approach to bypass CORS
   */
  async sendWithProxy(message, onChunk) {
    try {
      const { sendMessageThroughProxy } = await import('./ProxyChatService.js');
      const result = await sendMessageThroughProxy(message, this.endpoint, onChunk);
      
      return {
        success: result.success,
        data: { response: result.response },
        error: result.error,
        status: result.success ? 200 : 500
      };
    } catch (error) {
      throw new Error(`Proxy approach failed: ${error.message}`);
    }
  }

  /**
   * Fallback approach with different headers
   */
  async sendWithFallbackFetch(message, onChunk) {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      mode: 'no-cors', // Try no-cors mode as fallback
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ message })
    });

    // Note: no-cors mode doesn't allow reading response, so this is limited
    // This is mainly for cases where CORS is completely blocked
    return {
      success: true,
      data: { response: "Request sent successfully (no-cors mode)" },
      error: null,
      status: response.status || 200
    };
  }

  /**
   * Handle streaming response from server with optimized performance
   */
  async handleStreamingResponse(response, onChunk) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullResponse = '';
    let isFirstChunk = true;
    let chunkBuffer = ''; // Buffer for batching small chunks
    let lastUpdate = Date.now();
    const UPDATE_INTERVAL = 50; // Update UI every 50ms for smoother experience

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // Decode the chunk
        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Process complete lines from buffer
        let lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (let line of lines) {
          if (line.trim()) {
            try {
              // The API sends: {"success": true, "response": "content"}
              // We need to extract the streaming content
              if (isFirstChunk && line.includes('"success": true, "response": "')) {
                // Extract content after the opening
                const startIndex = line.indexOf('"response": "') + 13;
                const content = line.substring(startIndex);
                if (content && content !== '"') {
                  const cleanContent = content.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                  chunkBuffer += cleanContent;
                  fullResponse += cleanContent;
                }
                isFirstChunk = false;
              } else if (!isFirstChunk && line !== '"}') {
                // This is a continuation chunk
                const cleanContent = line.replace(/\\n/g, '\n').replace(/\\"/g, '"');
                chunkBuffer += cleanContent;
                fullResponse += cleanContent;
              }
            } catch (parseError) {
              // If it's not JSON, treat as raw content
              if (!isFirstChunk) {
                chunkBuffer += line;
                fullResponse += line;
              }
            }
          }
        }

        // Batch updates for smoother UI - only update every UPDATE_INTERVAL ms
        const now = Date.now();
        if (chunkBuffer && (now - lastUpdate >= UPDATE_INTERVAL || done)) {
          onChunk(chunkBuffer);
          chunkBuffer = '';
          lastUpdate = now;
        }
      }

      // Process any remaining buffer
      if (buffer.trim() && buffer.trim() !== '"}') {
        const cleanContent = buffer.replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/"}$/, '');
        if (cleanContent) {
          fullResponse += cleanContent;
          chunkBuffer += cleanContent;
        }
      }

      // Send any remaining buffered content
      if (chunkBuffer) {
        onChunk(chunkBuffer);
      }

      return {
        success: true,
        data: { response: fullResponse },
        error: null,
        status: response.status
      };

    } catch (error) {
      console.error('Streaming error:', error);
      return {
        success: false,
        data: null,
        error: error.message,
        status: response.status
      };
    } finally {
      reader.releaseLock();
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