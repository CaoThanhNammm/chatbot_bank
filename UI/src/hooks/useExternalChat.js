/**
 * useExternalChat Hook
 * Custom hook for managing external chat API interactions
 */

import { useState, useCallback } from 'react';
import externalChatService from '../services/ExternalChatService';

export const useExternalChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastResponse, setLastResponse] = useState(null);

  /**
   * Send message to external chat API
   */
  const sendMessage = useCallback(async (message) => {
    if (!message?.trim()) {
      setError('Message cannot be empty');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await externalChatService.sendMessage(message.trim());
      setLastResponse(response);
      
      if (!response.success) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      return {
        success: false,
        data: null,
        error: errorMessage,
        status: 500
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send message with custom options
   */
  const sendMessageWithOptions = useCallback(async (message, options = {}) => {
    if (!message?.trim()) {
      setError('Message cannot be empty');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await externalChatService.sendMessageWithOptions(message.trim(), options);
      setLastResponse(response);
      
      if (!response.success) {
        setError(response.error);
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      return {
        success: false,
        data: null,
        error: errorMessage,
        status: 500
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Test connection to external API
   */
  const testConnection = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await externalChatService.testConnection();
      setLastResponse(response);
      
      if (!response.success) {
        setError(response.message || 'Connection test failed');
      }
      
      return response;
    } catch (err) {
      const errorMessage = err.message || 'Connection test failed';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setLastResponse(null);
  }, []);

  return {
    // States
    isLoading,
    error,
    lastResponse,
    
    // Actions
    sendMessage,
    sendMessageWithOptions,
    testConnection,
    clearError,
    reset,
    
    // Computed values
    hasError: !!error,
    isConnected: lastResponse?.success === true,
  };
};

export default useExternalChat;