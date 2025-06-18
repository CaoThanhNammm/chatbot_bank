/**
 * Proxy Chat Service
 * Service to handle chat requests through a proxy to avoid CORS issues
 */

/**
 * Send message through proxy endpoint
 * @param {string} message - The message to send
 * @param {string} targetUrl - The target API URL
 * @param {Function} onChunk - Optional callback for streaming chunks
 * @returns {Promise<Object>} - API response
 */
export const sendMessageThroughProxy = async (message, targetUrl, onChunk = null) => {
  try {
    // Use local proxy endpoint
    const proxyEndpoint = '/api/proxy/chat';
    
    const response = await fetch(proxyEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: message,
        target_url: targetUrl,
        streaming: onChunk ? true : false
      })
    });

    if (!response.ok) {
      throw new Error(`Proxy error! status: ${response.status}`);
    }

    // Handle streaming response if callback provided
    if (onChunk && typeof onChunk === 'function') {
      return await handleProxyStreamingResponse(response, onChunk);
    } else {
      // Regular response
      const data = await response.json();
      return {
        success: data.success || true,
        response: data.response || data.message,
        error: data.error || null
      };
    }
  } catch (error) {
    console.error('Proxy chat error:', error);
    return {
      success: false,
      error: error.message || 'Failed to connect through proxy'
    };
  }
};

/**
 * Handle streaming response from proxy
 * @param {Response} response - Fetch response object
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<Object>} - Final response object
 */
const handleProxyStreamingResponse = async (response, onChunk) => {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullResponse = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      // Process complete lines from buffer
      let lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (let line of lines) {
        if (line.trim()) {
          try {
            // Try to parse as JSON first
            const data = JSON.parse(line);
            if (data.chunk) {
              fullResponse += data.chunk;
              onChunk(data.chunk);
            } else if (data.content) {
              fullResponse += data.content;
              onChunk(data.content);
            }
          } catch (parseError) {
            // If not JSON, treat as raw content
            fullResponse += line;
            onChunk(line);
          }
        }
      }
    }

    // Process remaining buffer
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer);
        if (data.chunk) {
          fullResponse += data.chunk;
          onChunk(data.chunk);
        }
      } catch (parseError) {
        fullResponse += buffer;
        onChunk(buffer);
      }
    }

    return {
      success: true,
      response: fullResponse
    };

  } catch (error) {
    console.error('Proxy streaming error:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    reader.releaseLock();
  }
};

export default {
  sendMessageThroughProxy
};