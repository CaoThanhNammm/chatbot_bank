/**
 * CORS Test Script
 * Test script to verify that CORS is properly configured for all endpoints
 */

import apiUrlManager from './ApiUrlManager.js';

/**
 * Test CORS configuration for both base URLs
 */
async function testCorsConfiguration() {
  console.log('=== CORS Configuration Test ===');
  
  // Enable universal CORS
  const corsStatus = apiUrlManager.enableUniversalCors();
  console.log('CORS Status:', corsStatus);
  
  // Test endpoints
  const testEndpoints = [
    '/health',
    '/chat',
    '/auth/login',
    '/models',
    '/conversations'
  ];
  
  console.log('\n=== Testing Endpoints ===');
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`\nTesting endpoint: ${endpoint}`);
      
      // Get URL and headers
      const url = apiUrlManager.getUrl(endpoint);
      const headers = apiUrlManager.getUniversalCorsHeaders();
      
      console.log(`URL: ${url}`);
      console.log('Headers:', headers);
      
      // Test with universal request method
      const response = await apiUrlManager.makeUniversalRequest(url, {
        method: 'GET'
      });
      
      console.log(`✓ Success - Status: ${response.status}`);
      
    } catch (error) {
      console.log(`✗ Failed - Error: ${error.message}`);
    }
  }
  
  console.log('\n=== CORS Test Complete ===');
}

/**
 * Test specific URL with CORS
 */
async function testSpecificUrl(url) {
  console.log(`\n=== Testing Specific URL: ${url} ===`);
  
  try {
    const response = await apiUrlManager.makeUniversalRequest(url, {
      method: 'GET'
    });
    
    console.log(`✓ Success - Status: ${response.status}`);
    return response;
    
  } catch (error) {
    console.log(`✗ Failed - Error: ${error.message}`);
    throw error;
  }
}

/**
 * Test both base URLs directly
 */
async function testBaseUrls() {
  console.log('\n=== Testing Base URLs ===');
  
  const baseUrls = [
    apiUrlManager.NGROK_BASE,
    apiUrlManager.NGROK_BASE_BE
  ];
  
  for (const baseUrl of baseUrls) {
    console.log(`\nTesting base URL: ${baseUrl}`);
    
    try {
      const response = await apiUrlManager.makeUniversalRequest(`${baseUrl}/health`, {
        method: 'GET'
      });
      
      console.log(`✓ Base URL accessible - Status: ${response.status}`);
      
    } catch (error) {
      console.log(`✗ Base URL failed - Error: ${error.message}`);
    }
  }
}

// Export test functions
export {
  testCorsConfiguration,
  testSpecificUrl,
  testBaseUrls
};

// Auto-run test if this file is executed directly
if (typeof window !== 'undefined') {
  window.corsTest = {
    testCorsConfiguration,
    testSpecificUrl,
    testBaseUrls,
    apiUrlManager
  };
  
  console.log('CORS test functions available in window.corsTest');
  console.log('Run window.corsTest.testCorsConfiguration() to test CORS setup');
}