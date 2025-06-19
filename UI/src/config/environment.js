/**
 * Environment Configuration
 * Centralized configuration for different environments
 * Note: URL management is now handled by ApiUrlManager.js
 */

import apiUrlManager from './ApiUrlManager.js';

// Environment types
export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  STAGING: 'staging'
};

// Current environment (can be set via environment variable)
export const CURRENT_ENV = import.meta.env.MODE || ENVIRONMENTS.DEVELOPMENT;

// API Configurations for different environments - Now using ApiUrlManager
export const API_CONFIGS = {
  [ENVIRONMENTS.DEVELOPMENT]: {
    BASE_URL: apiUrlManager.LOCALHOST_BASE,
    CHAT_ENDPOINT: apiUrlManager.getChatUrl(),
    TIMEOUT: 30000,
    USE_EXTERNAL_CHAT: false
  },
  
  [ENVIRONMENTS.STAGING]: {
    BASE_URL: apiUrlManager.LOCALHOST_BASE,
    CHAT_ENDPOINT: apiUrlManager.getChatUrl(),
    TIMEOUT: 30000,
    USE_EXTERNAL_CHAT: false
  },
  
  [ENVIRONMENTS.PRODUCTION]: {
    BASE_URL: apiUrlManager.LOCALHOST_BASE,
    CHAT_ENDPOINT: apiUrlManager.getChatUrl(),
    TIMEOUT: 30000,
    USE_EXTERNAL_CHAT: false
  }
};

// Get current environment config
export const getCurrentConfig = () => {
  return API_CONFIGS[CURRENT_ENV] || API_CONFIGS[ENVIRONMENTS.DEVELOPMENT];
};

// Chat API Configuration - Now using ApiUrlManager
export const CHAT_CONFIG = {
  // Local endpoint for chat (primary)
  LOCAL_ENDPOINT: apiUrlManager.getLocalhostUrl('/chat'),
  
  // Guest chat endpoint (ngrok)
  GUEST_CHAT_ENDPOINT: apiUrlManager.getGuestChatUrl(),
  
  // Ngrok endpoint for external chat
  NGROK_ENDPOINT: apiUrlManager.getChatUrl(),
  
  // Headers for ngrok requests
  NGROK_HEADERS: apiUrlManager.getNgrokHeaders(),
  
  // Default headers
  DEFAULT_HEADERS: apiUrlManager.getLocalhostHeaders()
};

// Feature flags
export const FEATURE_FLAGS = {
  USE_EXTERNAL_CHAT: false, // Changed to false to use local backend
  ENABLE_CHAT_HISTORY: true,
  ENABLE_FILE_UPLOAD: true,
  ENABLE_VOICE_INPUT: false,
  DEBUG_MODE: CURRENT_ENV === ENVIRONMENTS.DEVELOPMENT
};

// Export current config as default
export default getCurrentConfig();