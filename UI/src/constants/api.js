/**
 * API Constants and Configuration
 * Centralized place for all API-related constants
 */

import { getCurrentConfig, CHAT_CONFIG } from '../config/environment.js';
import apiUrlManager from '../config/ApiUrlManager.js';

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

// API Endpoints - Now using ApiUrlManager for centralized URL management
export const API_ENDPOINTS = {
  // Authentication - localhost endpoints
  AUTH: {
    LOGIN: apiUrlManager.getAuthUrls().login,
    REGISTER: apiUrlManager.getAuthUrls().register,
    LOGOUT: apiUrlManager.getAuthUrls().logout,
    PROFILE: apiUrlManager.getAuthUrls().profile,
    UPDATE_PROFILE: apiUrlManager.getAuthUrls().updateProfile,
    CHANGE_PASSWORD: apiUrlManager.getAuthUrls().changePassword,
    REFRESH_TOKEN: apiUrlManager.getAuthUrls().refreshToken,
    FORGOT_PASSWORD: apiUrlManager.getAuthUrls().forgotPassword,
    RESET_PASSWORD: apiUrlManager.getAuthUrls().resetPassword,
  },

  // Chat - mixed endpoints (ngrok for chat, localhost for conversations)
  CHAT: {
    SEND_MESSAGE: apiUrlManager.getConversationUrls().create, // localhost for conversation management
    SIMPLE_CHAT: apiUrlManager.getChatUrl(), // ngrok for actual chat
    EXTERNAL_CHAT: apiUrlManager.getChatUrl(), // ngrok for external chat
    GUEST_CHAT: apiUrlManager.getGuestChatUrl(), // ngrok for guest chat
    CONVERSATIONS: apiUrlManager.getConversationUrls().list, // localhost
    CONVERSATION: (id) => apiUrlManager.getConversationUrls().get(id), // localhost
    DELETE_CONVERSATION: (id) => apiUrlManager.getConversationUrls().delete(id), // localhost
    CLEAR_CONVERSATION: (id) => apiUrlManager.getConversationUrls().clear(id), // localhost
    CONVERSATION_MESSAGES: (id) => apiUrlManager.getConversationUrls().messages(id), // localhost
  },

  // Models - localhost endpoints
  MODELS: {
    LIST: apiUrlManager.getModelUrls().list,
    CREATE: apiUrlManager.getModelUrls().create,
    GET: (id) => apiUrlManager.getModelUrls().get(id),
    UPDATE: (id) => apiUrlManager.getModelUrls().update(id),
    DELETE: (id) => apiUrlManager.getModelUrls().delete(id),
    ACTIVE: apiUrlManager.getModelUrls().active,
    ACTIVATE: (id) => apiUrlManager.getModelUrls().activate(id),
    DEACTIVATE: (id) => apiUrlManager.getModelUrls().deactivate(id),
    CLONE: (id) => apiUrlManager.getModelUrls().clone(id),
    // Ngrok endpoint for loading models
    LOAD_MODEL: apiUrlManager.getLoadModelUrl(),
  },

  // Fine-tuning - mixed endpoints
  FINE_TUNING: {
    // Localhost endpoints for management
    MODELS: apiUrlManager.getFineTuningManagementUrls().models,
    JOBS: apiUrlManager.getFineTuningManagementUrls().jobs,
    CREATE_JOB: apiUrlManager.getFineTuningManagementUrls().createJob,
    GET_JOB: (id) => apiUrlManager.getFineTuningManagementUrls().getJob(id),
    UPDATE_JOB: (id) => apiUrlManager.getFineTuningManagementUrls().updateJob(id),
    DELETE_JOB: (id) => apiUrlManager.getFineTuningManagementUrls().deleteJob(id),
    START_JOB: (id) => apiUrlManager.getFineTuningManagementUrls().startJob(id),
    STOP_JOB: (id) => apiUrlManager.getFineTuningManagementUrls().stopJob(id),
    PAUSE_JOB: (id) => apiUrlManager.getFineTuningManagementUrls().pauseJob(id),
    RESUME_JOB: (id) => apiUrlManager.getFineTuningManagementUrls().resumeJob(id),
    JOB_LOGS: (id) => apiUrlManager.getFineTuningManagementUrls().jobLogs(id),
    
    // Datasets - localhost
    DATASETS: apiUrlManager.getFineTuningManagementUrls().datasets,
    UPLOAD_DATASET: apiUrlManager.getFineTuningManagementUrls().uploadDataset,
    GET_DATASET: (id) => apiUrlManager.getFineTuningManagementUrls().getDataset(id),
    DELETE_DATASET: (id) => apiUrlManager.getFineTuningManagementUrls().deleteDataset(id),
    VALIDATE_DATASET: (id) => apiUrlManager.getFineTuningManagementUrls().validateDataset(id),
    DATASET_PREVIEW: (id) => apiUrlManager.getFineTuningManagementUrls().datasetPreview(id),
    
    // Ngrok endpoints for actual fine-tuning operations
    RUN_TASK: apiUrlManager.getRunFineTuningTaskUrl(),
    START_FINETUNING: apiUrlManager.getStartFineTuningUrl(),
    TASK_STATUS: (id) => apiUrlManager.getTaskStatusUrl(id),
    ALL_TASKS: apiUrlManager.getAllTasksUrl(),
    FINETUNE: apiUrlManager.getFineTuningUrl(),
    FINETUNE_TASKS: apiUrlManager.getFineTuningTasksUrl(),
  },

  // Admin - localhost endpoints
  ADMIN: {
    // User Management
    USERS: apiUrlManager.getAdminUrls().users,
    GET_USER: (id) => apiUrlManager.getAdminUrls().getUser(id),
    CREATE_USER: apiUrlManager.getAdminUrls().createUser,
    UPDATE_USER: (id) => apiUrlManager.getAdminUrls().updateUser(id),
    DELETE_USER: (id) => apiUrlManager.getAdminUrls().deleteUser(id),
    ACTIVATE_USER: (id) => apiUrlManager.getAdminUrls().activateUser(id),
    DEACTIVATE_USER: (id) => apiUrlManager.getAdminUrls().deactivateUser(id),
    RESET_USER_PASSWORD: (id) => apiUrlManager.getAdminUrls().resetUserPassword(id),
    
    // System Management
    SYSTEM_SETTINGS: apiUrlManager.getAdminUrls().systemSettings,
    UPDATE_SYSTEM_SETTINGS: apiUrlManager.getAdminUrls().updateSystemSettings,
    SYSTEM_LOGS: apiUrlManager.getAdminUrls().systemLogs,
    CLEAR_SYSTEM_LOGS: apiUrlManager.getAdminUrls().clearSystemLogs,
    
    // Analytics
    ANALYTICS: apiUrlManager.getAdminUrls().analytics,
    USER_ANALYTICS: apiUrlManager.getAdminUrls().userAnalytics,
    CHAT_ANALYTICS: apiUrlManager.getAdminUrls().chatAnalytics,
    MODEL_ANALYTICS: apiUrlManager.getAdminUrls().modelAnalytics,
  },

  // System - localhost endpoints
  SYSTEM: {
    STATUS: apiUrlManager.getSystemUrls().status,
    HEALTH: apiUrlManager.getSystemUrls().health,
    VERSION: apiUrlManager.getSystemUrls().version,
    METRICS: apiUrlManager.getSystemUrls().metrics,
    PING: apiUrlManager.getSystemUrls().ping,
  },

  // Files - localhost endpoints
  FILES: {
    UPLOAD: apiUrlManager.getFileUrls().upload,
    DOWNLOAD: (id) => apiUrlManager.getFileUrls().download(id),
    DELETE: (id) => apiUrlManager.getFileUrls().delete(id),
    LIST: apiUrlManager.getFileUrls().list,
    GET_INFO: (id) => apiUrlManager.getFileUrls().getInfo(id),
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