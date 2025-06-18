// Legacy API wrapper - now uses the new ApiService
import apiService from '../services/ApiService';

// Authentication API - using new ApiService
export const authApi = {
  register: (userData) => apiService.register(userData),
  login: (credentials) => apiService.login(credentials),
  logout: () => apiService.logout(),
  getProfile: () => apiService.getProfile(),
  updateProfile: (profileData) => apiService.updateProfile(profileData),
  changePassword: (passwordData) => apiService.changePassword(passwordData),
};

// Chat API - using new ApiService
export const chatApi = {
  sendMessage: (message, conversationId = null) => apiService.sendMessage(message, conversationId),
  sendSimpleMessage: (message) => apiService.sendSimpleMessage(message), // New simple chat method
  createConversation: (title, userId = null) => apiService.createConversation(title, userId),
  getConversations: (userId = null) => apiService.getConversations(userId),
  getConversation: (conversationId) => apiService.getConversation(conversationId),
  addMessageToConversation: (conversationId, role, content) => apiService.addMessageToConversation(conversationId, role, content),
  getConversationMessages: (conversationId) => apiService.getConversationMessages(conversationId),
  deleteConversation: (conversationId) => apiService.deleteConversation(conversationId),
  clearConversation: (conversationId) => apiService.clearConversation(conversationId),
};

// Model Management API - using new ApiService
export const modelApi = {
  getModels: () => apiService.getModels(),
  createModel: (modelData) => apiService.createModel(modelData),
  getModel: (modelId) => apiService.getModel(modelId),
  updateModel: (modelId, modelData) => apiService.updateModel(modelId, modelData),
  deleteModel: (modelId) => apiService.deleteModel(modelId),
  getActiveModel: () => apiService.getActiveModel(),
  activateModel: (modelId) => apiService.activateModel(modelId),
};

// Fine-tuning API - using new ApiService
export const fineTuningApi = {
  getJobs: () => apiService.getFineTuningJobs(),
  createJob: (jobData) => apiService.createFineTuningJob(jobData),
  getJob: (jobId) => apiService.getFineTuningJob(jobId),
  deleteJob: (jobId) => apiService.deleteFineTuningJob(jobId),
  startJob: (jobId) => apiService.startFineTuningJob(jobId),
  stopJob: (jobId) => apiService.stopFineTuningJob(jobId),
  getDatasets: () => apiService.getDatasets(),
  uploadDataset: (formData) => apiService.uploadDataset(formData),
  deleteDataset: (datasetId) => apiService.deleteDataset(datasetId),
};

// Admin API - using new ApiService
export const adminApi = {
  getUsers: () => apiService.getUsers(),
  getUser: (userId) => apiService.getUser(userId),
  updateUser: (userId, userData) => apiService.updateUser(userId, userData),
  deleteUser: (userId) => apiService.deleteUser(userId),
  activateUser: (userId) => apiService.activateUser(userId),
  deactivateUser: (userId) => apiService.deactivateUser(userId),
};

// System API - using new ApiService
export const systemApi = {
  getStatus: () => apiService.getSystemStatus(),
  getHealth: () => apiService.getSystemHealth(),
};

// Export default API object with all services (backward compatibility)
const api = {
  auth: authApi,
  chat: chatApi,
  model: modelApi,
  fineTuning: fineTuningApi,
  admin: adminApi,
  system: systemApi,
};

export default api;

// Also export the new ApiService for direct use
export { default as ApiService } from '../services/ApiService';
