/**
 * API Constants and Configuration
 * Centralized place for all API-related constants
 */

import { getCurrentConfig, CHAT_CONFIG } from '../config/environment.js';

// Get current environment configuration
const envConfig = getCurrentConfig();

// Base Configuration
export const API_CONFIG = {
  BASE_URL: envConfig.BASE_URL,
  TIMEOUT: envConfig.TIMEOUT,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
};

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/logout',
    PROFILE: '/auth/me',
    UPDATE_PROFILE: '/profile',
    REFRESH_TOKEN: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Chat
  CHAT: {
    SEND_MESSAGE: '/chat',
    SIMPLE_CHAT: envConfig.CHAT_ENDPOINT || CHAT_CONFIG.NGROK_ENDPOINT, // Use environment-specific chat endpoint
    EXTERNAL_CHAT: CHAT_CONFIG.NGROK_ENDPOINT, // External ngrok chat API
    CONVERSATIONS: '/conversations',
    CONVERSATION: (id) => `/conversations/${id}`,
    DELETE_CONVERSATION: (id) => `/conversations/${id}`,
    CLEAR_CONVERSATION: (id) => `/conversations/${id}/clear`,
    CONVERSATION_MESSAGES: (id) => `/conversations/${id}/messages`,
  },

  // Models
  MODELS: {
    LIST: '/models',
    CREATE: '/models',
    GET: (id) => `/models/${id}`,
    UPDATE: (id) => `/models/${id}`,
    DELETE: (id) => `/models/${id}`,
    ACTIVE: '/models/active',
    ACTIVATE: (id) => `/models/${id}/activate`,
    DEACTIVATE: (id) => `/models/${id}/deactivate`,
    CLONE: (id) => `/models/${id}/clone`,
  },

  // Fine-tuning
  FINE_TUNING: {
    JOBS: '/fine-tuning/jobs',
    CREATE_JOB: '/fine-tuning/jobs',
    GET_JOB: (id) => `/fine-tuning/jobs/${id}`,
    UPDATE_JOB: (id) => `/fine-tuning/jobs/${id}`,
    DELETE_JOB: (id) => `/fine-tuning/jobs/${id}`,
    START_JOB: (id) => `/fine-tuning/jobs/${id}/start`,
    STOP_JOB: (id) => `/fine-tuning/jobs/${id}/stop`,
    PAUSE_JOB: (id) => `/fine-tuning/jobs/${id}/pause`,
    RESUME_JOB: (id) => `/fine-tuning/jobs/${id}/resume`,
    JOB_LOGS: (id) => `/fine-tuning/jobs/${id}/logs`,
    
    // Datasets
    DATASETS: '/fine-tuning/datasets',
    UPLOAD_DATASET: '/fine-tuning/datasets',
    GET_DATASET: (id) => `/fine-tuning/datasets/${id}`,
    DELETE_DATASET: (id) => `/fine-tuning/datasets/${id}`,
    VALIDATE_DATASET: (id) => `/fine-tuning/datasets/${id}/validate`,
    DATASET_PREVIEW: (id) => `/fine-tuning/datasets/${id}/preview`,
  },

  // Admin
  ADMIN: {
    // User Management
    USERS: '/admin/users',
    GET_USER: (id) => `/admin/users/${id}`,
    CREATE_USER: '/admin/users',
    UPDATE_USER: (id) => `/admin/users/${id}`,
    DELETE_USER: (id) => `/admin/users/${id}`,
    ACTIVATE_USER: (id) => `/admin/users/${id}/activate`,
    DEACTIVATE_USER: (id) => `/admin/users/${id}/deactivate`,
    RESET_USER_PASSWORD: (id) => `/admin/users/${id}/reset-password`,
    
    // System Management
    SYSTEM_SETTINGS: '/admin/system/settings',
    UPDATE_SYSTEM_SETTINGS: '/admin/system/settings',
    SYSTEM_LOGS: '/admin/system/logs',
    CLEAR_SYSTEM_LOGS: '/admin/system/logs/clear',
    
    // Analytics
    ANALYTICS: '/admin/analytics',
    USER_ANALYTICS: '/admin/analytics/users',
    CHAT_ANALYTICS: '/admin/analytics/chats',
    MODEL_ANALYTICS: '/admin/analytics/models',
  },

  // System
  SYSTEM: {
    STATUS: '/system/status',
    HEALTH: '/system/health',
    VERSION: '/system/version',
    METRICS: '/system/metrics',
    PING: '/system/ping',
  },

  // Files
  FILES: {
    UPLOAD: '/files/upload',
    DOWNLOAD: (id) => `/files/${id}/download`,
    DELETE: (id) => `/files/${id}`,
    LIST: '/files',
    GET_INFO: (id) => `/files/${id}/info`,
  },
};

// Error Messages
export const API_ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error - please check your connection',
  SERVER_ERROR: 'Server error occurred',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access forbidden',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  TIMEOUT: 'Request timeout',
  UNKNOWN_ERROR: 'An unexpected error occurred',
};

// Request Headers
export const REQUEST_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
};

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
};

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
  IS_AUTHENTICATED: 'isAuthenticated',
  THEME: 'theme',
  LANGUAGE: 'language',
  SETTINGS: 'settings',
};

// API Response Status
export const API_RESPONSE_STATUS = {
  SUCCESS: 'success',
  ERROR: 'error',
  LOADING: 'loading',
  IDLE: 'idle',
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'application/json',
    'text/csv',
    'text/plain',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
  ],
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
};

// Rate Limiting
export const RATE_LIMITS = {
  CHAT_MESSAGES_PER_MINUTE: 30,
  API_REQUESTS_PER_MINUTE: 100,
  FILE_UPLOADS_PER_HOUR: 10,
};

// WebSocket Events (if needed)
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  ERROR: 'error',
  CHAT_MESSAGE: 'chat_message',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',
};

// Export all constants as a single object for convenience
export const API_CONSTANTS = {
  CONFIG: API_CONFIG,
  METHODS: HTTP_METHODS,
  STATUS: HTTP_STATUS,
  ENDPOINTS: API_ENDPOINTS,
  ERRORS: API_ERROR_MESSAGES,
  HEADERS: REQUEST_HEADERS,
  CONTENT_TYPES,
  STORAGE_KEYS,
  RESPONSE_STATUS: API_RESPONSE_STATUS,
  PAGINATION,
  FILE_UPLOAD,
  RATE_LIMITS,
  WS_EVENTS,
};