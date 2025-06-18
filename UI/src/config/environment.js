/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

// Environment types
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging'
};

// Current environment (can be set via environment variable)
export const CURRENT_ENV = import.meta.env.MODE || ENVIRONMENTS.DEVELOPMENT;

// API Configurations for different environments
export const API_CONFIGS = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    BASE_URL: 'https://21f2-171-247-78-59.ngrok-free.app/api',
    CHAT_ENDPOINT: 'https://b12a-34-57-198-14.ngrok-free.app/api/chat', // Using ngrok for development
    TIMEOUT: 30000,
    USE_EXTERNAL_CHAT: true
  },
  
  [ENVIRONMENTS.STAGING]: {
    BASE_URL: 'https://21f2-171-247-78-59.ngrok-free.app/api',
    CHAT_ENDPOINT: 'https://b12a-34-57-198-14.ngrok-free.app/api/chat',
    TIMEOUT: 30000,
    USE_EXTERNAL_CHAT: false
  },
  
  [ENVIRONMENTS.PRODUCTION]: {
    BASE_URL: 'https://21f2-171-247-78-59.ngrok-free.app/api',
    CHAT_ENDPOINT: 'https://b12a-34-57-198-14.ngrok-free.app/api/chat',
    TIMEOUT: 30000,
    USE_EXTERNAL_CHAT: false
  }
};

// Get current environment config
export const getCurrentConfig = () => {
  return API_CONFIGS[CURRENT_ENV] || API_CONFIGS[ENVIRONMENTS.DEVELOPMENT];
};

// Chat API Configuration
export const CHAT_CONFIG = {
  // Ngrok endpoint for external chat
  NGROK_ENDPOINT: 'https://b12a-34-57-198-14.ngrok-free.app/api/chat',
  
  // Guest chat endpoint (new API)
  GUEST_CHAT_ENDPOINT: 'https://b12a-34-57-198-14.ngrok-free.app/api/chat',
  
  // Local endpoint for internal chat
  LOCAL_ENDPOINT: '/api/chat',
  
  // Headers for ngrok requests
  NGROK_HEADERS: {
    'ngrok-skip-browser-warning': 'true',
    'Content-Type': 'application/json'
  },
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

// Feature flags
export const FEATURE_FLAGS = {
  USE_EXTERNAL_CHAT: true,
  ENABLE_CHAT_HISTORY: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_VOICE_INPUT: false,
  DEBUG_MODE: CURRENT_ENV === ENVIRONMENTS.DEVELOPMENT
};

// Export current config as default
export default getCurrentConfig();