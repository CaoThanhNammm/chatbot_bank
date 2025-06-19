/**
 * API Usage Examples with CORS Bypass
 * This file shows how to use the enhanced ApiUrlManager with automatic CORS handling
 */

import apiUrlManager from './ApiUrlManager.js';

// ==================== EXAMPLES ====================

/**
 * Example 1: Using the convenience methods (Recommended)
 */
export const exampleUsingConvenienceMethods = async () => {
  try {
    // GET request - automatically handles CORS
    const response = await apiUrlManager.get('/finetune');
    const data = await response.json();
    console.log('Fine-tuning data:', data);

    // POST request - automatically handles CORS
    const postResponse = await apiUrlManager.post('/finetune', {
      model_name: 'test-model',
      training_data: 'sample data'
    });
    
    // PUT request - automatically handles CORS
    const putResponse = await apiUrlManager.put('/models/123', {
      name: 'Updated Model'
    });

    // DELETE request - automatically handles CORS
    const deleteResponse = await apiUrlManager.delete('/models/123');

  } catch (error) {
    console.error('API request failed:', error);
  }
};

/**
 * Example 2: Using makeCorsRequest directly
 */
export const exampleUsingMakeCorsRequest = async () => {
  try {
    const url = apiUrlManager.getFineTuningUrl();
    
    const response = await apiUrlManager.makeCorsRequest(url, {
      method: 'POST',
      body: JSON.stringify({
        model_name: 'custom-model',
        parameters: {
          learning_rate: 0.001,
          epochs: 10
        }
      })
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Fine-tuning started:', result);
    }
  } catch (error) {
    console.error('Fine-tuning request failed:', error);
  }
};

/**
 * Example 3: Traditional fetch with enhanced headers
 */
export const exampleUsingTraditionalFetch = async () => {
  try {
    const url = apiUrlManager.getChatUrl();
    const headers = apiUrlManager.getCorsHeaders('/chat', {
      'Authorization': 'Bearer your-token-here'
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        message: 'Hello, chatbot!',
        conversation_id: '123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Chat response:', data);
    }
  } catch (error) {
    console.error('Chat request failed:', error);
    
    // Fallback: try with proxied URL
    try {
      const proxiedUrl = apiUrlManager.getProxiedUrl('/chat');
      const fallbackResponse = await fetch(proxiedUrl, {
        method: 'POST',
        headers: headers,
        mode: 'no-cors',
        body: JSON.stringify({
          message: 'Hello, chatbot!',
          conversation_id: '123'
        })
      });
      console.log('Fallback request completed');
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
  }
};

/**
 * Example 4: Handling different endpoint types
 */
export const exampleHandlingDifferentEndpoints = async () => {
  // Ngrok endpoints (AI/ML services)
  try {
    const chatResponse = await apiUrlManager.get('/chat');
    const fineTuningResponse = await apiUrlManager.post('/finetune', {
      model: 'gpt-3.5-turbo',
      training_file: 'file-123'
    });
  } catch (error) {
    console.error('Ngrok endpoint failed:', error);
  }

  // Localhost endpoints (user management, etc.)
  try {
    const authUrls = apiUrlManager.getAuthUrls();
    const loginResponse = await apiUrlManager.post('/auth/login', {
      username: 'user@example.com',
      password: 'password123'
    });
  } catch (error) {
    console.error('Localhost endpoint failed:', error);
  }
};

/**
 * Example 5: Error handling and retry logic
 */
export const exampleWithErrorHandling = async () => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      const response = await apiUrlManager.get('/finetune/tasks');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Tasks retrieved:', data);
        break;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      retryCount++;
      console.warn(`Attempt ${retryCount} failed:`, error.message);
      
      if (retryCount >= maxRetries) {
        console.error('All retry attempts failed');
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Helper function to check if CORS is working
 */
export const testCorsConnection = async () => {
  const endpoints = [
    '/system/health',
    '/finetune',
    '/auth/me'
  ];

  const results = {};

  for (const endpoint of endpoints) {
    try {
      const response = await apiUrlManager.get(endpoint);
      results[endpoint] = {
        status: 'success',
        statusCode: response.status,
        url: apiUrlManager.getUrl(endpoint)
      };
    } catch (error) {
      results[endpoint] = {
        status: 'failed',
        error: error.message,
        url: apiUrlManager.getUrl(endpoint)
      };
    }
  }

  console.log('CORS Test Results:', results);
  return results;
};

/**
 * Helper function to update ngrok URLs dynamically
 */
export const updateNgrokUrls = (newNgrokUrl, newLocalhostUrl) => {
  if (newNgrokUrl) {
    apiUrlManager.updateNgrokBase(newNgrokUrl);
    console.log('Updated ngrok base URL to:', newNgrokUrl);
  }
  
  if (newLocalhostUrl) {
    apiUrlManager.updateLocalhostBase(newLocalhostUrl);
    console.log('Updated localhost base URL to:', newLocalhostUrl);
  }
};