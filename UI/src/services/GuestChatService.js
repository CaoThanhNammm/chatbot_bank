/**
 * Guest Chat Service
 * Service for handling guest chat API calls
 */

import { CHAT_CONFIG } from '../config/environment';

const API_ENDPOINT = CHAT_CONFIG.GUEST_CHAT_ENDPOINT;

/**
 * Send message to guest chat API with streaming support
 * @param {string} message - The message to send
 * @param {Function} onChunk - Optional callback for streaming chunks
 * @returns {Promise<Object>} - API response
 */
export const sendGuestMessage = async (message, onChunk = null) => {
  // Try multiple approaches to handle CORS
  const approaches = [
    () => sendWithCors(message, onChunk),
    () => sendWithNoCors(message, onChunk)
  ];

  for (let i = 0; i < approaches.length; i++) {
    try {
      console.log(`Trying guest chat approach ${i + 1}...`);
      const result = await approaches[i]();
      if (result.success) {
        console.log('Success with guest chat approach', i + 1);
        return result;
      }
    } catch (error) {
      console.log(`Guest chat approach ${i + 1} failed:`, error.message);
      if (i === approaches.length - 1) {
        // Last approach failed, return error
        return {
          success: false,
          error: `All guest chat approaches failed. Last error: ${error.message}`
        };
      }
    }
  }
};

/**
 * Primary CORS approach
 */
const sendWithCors = async (message, onChunk) => {
  const response = await fetch(API_ENDPOINT, {
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
    body: JSON.stringify({
      message: message
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // Handle streaming response if callback provided
  if (onChunk && typeof onChunk === 'function') {
    return await handleStreamingResponse(response, onChunk);
  } else {
    // Fallback: read entire response at once
    const text = await response.text();
    console.log('Raw API response:', text); // Debug log
    
    try {
      const data = JSON.parse(text);
      console.log('Parsed API data:', data); // Debug log
      
      if (!data.success) {
        throw new Error(data.error || 'API returned unsuccessful response');
      }
      
      // Extract only the response content, not the entire JSON object
      const responseContent = data.response || text;
      console.log('Extracted response content:', responseContent); // Debug log
      
      return {
        success: true,
        response: responseContent
      };
    } catch (parseError) {
      console.log('JSON parse error:', parseError); // Debug log
      
      // If it's not valid JSON, treat as raw text response
      // Check if the text looks like a JSON object string
      if (text.includes('"success": true') && text.includes('"response":')) {
        try {
          // Try to extract response from malformed JSON
          const responseMatch = text.match(/"response":\s*"([^"]*?)"/);
          if (responseMatch) {
            const extractedResponse = responseMatch[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
            console.log('Extracted from malformed JSON:', extractedResponse); // Debug log
            return {
              success: true,
              response: extractedResponse
            };
          }
        } catch (extractError) {
          console.warn('Failed to extract response from malformed JSON:', extractError);
        }
      }
      
      console.log('Returning raw text:', text); // Debug log
      return {
        success: true,
        response: text
      };
    }
  }
};

/**
 * Fallback no-cors approach
 */
const sendWithNoCors = async (message, onChunk) => {
  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true'
    },
    body: JSON.stringify({
      message: message
    })
  });

  // Note: no-cors mode doesn't allow reading response
  return {
    success: true,
    response: "Request sent successfully (no-cors mode - response not readable)"
  };
};

/**
 * Handle streaming response from server with optimized performance
 * @param {Response} response - Fetch response object
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<Object>} - Final response object
 */
const handleStreamingResponse = async (response, onChunk) => {
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
      response: fullResponse
    };

  } catch (error) {
    console.error('Streaming error:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    reader.releaseLock();
  }
};

export default {
  sendGuestMessage
};