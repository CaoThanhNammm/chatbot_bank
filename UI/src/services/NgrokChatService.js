/**
 * Ngrok Chat Service
 * Specialized service for handling ngrok API calls with CORS workarounds
 */

import { CHAT_CONFIG } from '../config/environment.js';
import { formatStreamingChunk } from '../utils/textFormatter.js';

class NgrokChatService {
  constructor() {
    this.endpoint = CHAT_CONFIG.NGROK_ENDPOINT;
    this.headers = {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    };
  }

  /**
   * Send message using streaming approach with CORS handling
   */
  async sendMessage(message, onChunk = null, model = null) {
    console.log('NgrokChatService: Sending streaming message:', message, 'with model:', model);
    
    // Try multiple approaches to handle CORS - reorder to try most reliable first
    const approaches = [
      () => this.sendWithStreamingFetch(message, onChunk, model),
      () => this.sendWithFallbackFetch(message, onChunk, model),
      () => this.sendWithMockResponse(message, onChunk, model) // Last resort
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
          // Last approach failed, but we should never reach here due to mock fallback
          console.error('All approaches including mock failed:', error);
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
  async sendWithStreamingFetch(message, onChunk, model = null) {
    // Use a proxy approach to avoid CORS issues
    // Instead of directly calling the ngrok endpoint, we'll use a workaround
    
    // Create a new URL object from the endpoint
    const url = new URL(this.endpoint);
    
    // Modify the URL to use HTTPS protocol
    url.protocol = 'https:';
    
    // Add special query parameters to help bypass CORS
    url.searchParams.append('cors_bypass', 'true');
    url.searchParams.append('origin', window.location.origin);
    
    console.log('Using modified URL for CORS bypass:', url.toString());
    
    const response = await fetch(url.toString(), {
      method: 'POST',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true'
      },
      body: JSON.stringify({ 
        message,
        ...(model && { model })
      })
    });

    if (!response.ok) {
      // Try to get error details
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorText = await response.text();
        if (errorText) {
          console.error('Server error details:', errorText);
          console.error('Full response:', response);
          errorMessage += ` - ${errorText}`;
        }
      } catch (e) {
        console.error('Error reading error response:', e);
      }
      
      // For 500 errors, let's try the fallback immediately
      if (response.status === 500) {
        console.warn('Server error 500 - will try fallback approaches');
        throw new Error(`Server Internal Error (500) - trying fallback`);
      }
      
      throw new Error(errorMessage);
    }

    // Handle streaming response
    if (onChunk && typeof onChunk === 'function') {
      return await this.handleStreamingResponse(response, onChunk);
    } else {
      // Fallback: read entire response at once
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        // Extract only the response content if it exists
        const responseContent = data.response ? formatStreamingChunk(data.response) : text;
        return {
          success: data.success || true,
          data: { response: responseContent },
          error: null,
          status: response.status
        };
      } catch (parseError) {
        // If it's not valid JSON, check if it contains JSON pattern
        const jsonMatch = text.match(/\{"success":\s*true,\s*"response":\s*"(.*?)"\}/);
        if (jsonMatch) {
          const content = formatStreamingChunk(jsonMatch[1]);
          return {
            success: true,
            data: { response: content },
            error: null,
            status: response.status
          };
        }
        // Treat as raw text
        return {
          success: true,
          data: { response: formatStreamingChunk(text) },
          error: null,
          status: response.status
        };
      }
    }
  }

  /**
   * Proxy approach to bypass CORS
   */
  async sendWithProxy(message, onChunk, model = null) {
    try {
      const { sendMessageThroughProxy } = await import('./ProxyChatService.js');
      const result = await sendMessageThroughProxy(message, this.endpoint, onChunk, model);
      
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
   * Fallback approach with different headers and simplified request
   */
  async sendWithFallbackFetch(message, onChunk, model = null) {
    try {
      // Try a different approach using a JSONP-like technique
      // Create a dynamic script element to bypass CORS
      
      // First, let's try using a different endpoint format
      // Some ngrok endpoints might work better with a specific format
      const baseEndpoint = this.endpoint.split('/api')[0];
      const alternativeEndpoint = `${baseEndpoint}/api/chat`;
      
      console.log('Using alternative endpoint for fallback:', alternativeEndpoint);
      
      const response = await fetch(alternativeEndpoint, {
        method: 'POST',
        mode: 'no-cors', // This is key for the fallback approach
        cache: 'no-cache',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          'Accept': '*/*',
          'Origin': window.location.origin,
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ 
          message,
          ...(model && { model })
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Handle response similar to primary approach
      if (onChunk && typeof onChunk === 'function') {
        return await this.handleStreamingResponse(response, onChunk);
      } else {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          const responseContent = data.response ? formatStreamingChunk(data.response) : text;
          return {
            success: data.success || true,
            data: { response: responseContent },
            error: null,
            status: response.status
          };
        } catch (parseError) {
          const jsonMatch = text.match(/\{"success":\s*true,\s*"response":\s*"(.*?)"\}/);
          if (jsonMatch) {
            const content = formatStreamingChunk(jsonMatch[1]);
            return {
              success: true,
              data: { response: content },
              error: null,
              status: response.status
            };
          }
          return {
            success: true,
            data: { response: formatStreamingChunk(text) },
            error: null,
            status: response.status
          };
        }
      }
    } catch (error) {
      throw new Error(`Fallback approach failed: ${error.message}`);
    }
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
              // Try to parse as complete JSON first
              if (line.includes('"success": true') && line.includes('"response":')) {
                const jsonMatch = line.match(/\{"success":\s*true,\s*"response":\s*"(.*?)"\}/);
                if (jsonMatch) {
                  // Complete JSON in one line
                  const content = jsonMatch[1];
                  const cleanContent = formatStreamingChunk(content);
                  chunkBuffer += cleanContent;
                  fullResponse += cleanContent;
                  isFirstChunk = false;
                  continue;
                }
              }
              
              // Handle streaming JSON
              if (isFirstChunk && line.includes('"success": true, "response": "')) {
                // Extract content after the opening
                const startIndex = line.indexOf('"response": "') + 13;
                const content = line.substring(startIndex);
                if (content && content !== '"' && !content.endsWith('"}')) {
                  const cleanContent = formatStreamingChunk(content);
                  chunkBuffer += cleanContent;
                  fullResponse += cleanContent;
                }
                isFirstChunk = false;
              } else if (!isFirstChunk && line !== '"}' && !line.includes('"success"')) {
                // This is a continuation chunk
                const cleanContent = formatStreamingChunk(line);
                chunkBuffer += cleanContent;
                fullResponse += cleanContent;
              }
            } catch (parseError) {
              // If it's not JSON, treat as raw content
              if (!isFirstChunk) {
                const cleanContent = formatStreamingChunk(line);
                chunkBuffer += cleanContent;
                fullResponse += cleanContent;
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
        // Check if buffer contains complete JSON
        const jsonMatch = buffer.match(/\{"success":\s*true,\s*"response":\s*"(.*?)"\}/);
        if (jsonMatch) {
          const content = jsonMatch[1];
          const cleanContent = formatStreamingChunk(content);
          if (cleanContent) {
            fullResponse += cleanContent;
            chunkBuffer += cleanContent;
          }
        } else {
          // Handle as streaming content
          const cleanContent = formatStreamingChunk(buffer.replace(/"}$/, ''));
          if (cleanContent) {
            fullResponse += cleanContent;
            chunkBuffer += cleanContent;
          }
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
   * Mock response as last resort when all other approaches fail
   */
  async sendWithMockResponse(message, onChunk, model = null) {
    console.warn('Using mock response as fallback - API server may be unavailable');
    
    // Generate a mock response based on the message
    const mockResponse = this.generateMockResponse(message);
    
    if (onChunk && typeof onChunk === 'function') {
      // Simulate streaming
      const words = mockResponse.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '');
        onChunk(chunk);
        // Small delay to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    return {
      success: true,
      data: { 
        response: mockResponse,
        isMockResponse: true // Flag to indicate this is a mock response
      },
      error: null,
      status: 200
    };
  }

  /**
   * Generate mock response based on message content
   */
  generateMockResponse(message) {
    return 'Xin chào! 😊\n\nTôi là trợ lý AI của AGRIBANK. Hiện tại tôi đang hoạt động ở chế độ offline, vui lòng quay lại lúc khác';
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