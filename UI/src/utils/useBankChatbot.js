/**
 * Custom hook for handling bank-related chatbot interactions
 */

import { useState, useCallback } from 'react';
import { processBankQuery } from './bankApiService';

/**
 * Detect if a message is a bank-related query
 * @param {string} message - User message
 * @returns {Object|null} - Query object or null if not a bank query
 */
const detectBankQuery = (message) => {
  // Simple pattern matching for bank-related queries
  const lowerMessage = message.toLowerCase();
  
  // Account balance query
  if (
    lowerMessage.includes('số dư') || 
    lowerMessage.includes('tài khoản') || 
    lowerMessage.includes('kiểm tra tài khoản')
  ) {
    return {
      type: 'account_info',
      // In a real app, you might extract account ID from the message
      // or use a default account ID from the user's profile
    };
  }
  
  // Transaction history query
  if (
    lowerMessage.includes('lịch sử giao dịch') || 
    lowerMessage.includes('giao dịch gần đây') ||
    lowerMessage.includes('sao kê')
  ) {
    return {
      type: 'transaction_history',
      // You might extract date ranges from the message
    };
  }
  
  // Transfer query
  if (
    lowerMessage.includes('chuyển tiền') || 
    lowerMessage.includes('chuyển khoản')
  ) {
    // This is a simplified example - in a real app, you would use
    // more sophisticated NLP to extract transfer details
    const toAccountMatch = lowerMessage.match(/(?:đến|tới|cho)\s+(?:tài khoản|tk)?\s*(\d+)/i);
    const amountMatch = lowerMessage.match(/(\d+(?:[.,]\d+)?)\s*(?:đồng|vnd|nghìn|triệu|k|tr)/i);
    
    return {
      type: 'transfer',
      to_account: toAccountMatch ? toAccountMatch[1] : null,
      amount: amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null,
      // Extract more details as needed
    };
  }
  
  // Exchange rate query
  if (
    lowerMessage.includes('tỷ giá') || 
    lowerMessage.includes('đổi tiền') ||
    lowerMessage.includes('quy đổi')
  ) {
    return {
      type: 'exchange_rates',
      // You might extract specific currencies from the message
    };
  }
  
  // Not a bank query
  return null;
};

/**
 * Custom hook for bank chatbot functionality
 * @param {Function} sendChatMessage - Function to send a message to the chat
 * @returns {Object} - Hook methods and state
 */
const useBankChatbot = (sendChatMessage) => {
  const [processing, setProcessing] = useState(false);
  
  /**
   * Process a user message for bank-related queries
   * @param {string} message - User message
   * @param {string} userId - User ID
   * @param {string} accountId - Default account ID
   * @returns {boolean} - True if message was handled as a bank query
   */
  const processMessage = useCallback(async (message, userId, accountId) => {
    // Detect if this is a bank-related query
    const bankQuery = detectBankQuery(message);
    
    if (!bankQuery) {
      return false; // Not a bank query, let the regular chatbot handle it
    }
    
    try {
      setProcessing(true);
      
      // Process the bank query
      const response = await processBankQuery(bankQuery, userId, accountId);
      
      // Send the response to the chat
      if (response && response.response) {
        sendChatMessage(response.response, true); // true indicates this is a bot message
      } else {
        // Fallback response if something went wrong
        sendChatMessage(
          "Xin lỗi, tôi không thể xử lý yêu cầu ngân hàng của bạn lúc này. Vui lòng thử lại sau.",
          true
        );
      }
      
      return true; // Indicate that we handled this message
    } catch (error) {
      console.error('Error processing bank query:', error);
      
      // Send error message to chat
      sendChatMessage(
        "Đã xảy ra lỗi khi xử lý yêu cầu ngân hàng của bạn. Vui lòng thử lại sau.",
        true
      );
      
      return true; // We still handled this message, even though there was an error
    } finally {
      setProcessing(false);
    }
  }, [sendChatMessage]);
  
  return {
    processMessage,
    processing,
    isBankQuery: detectBankQuery
  };
};

export default useBankChatbot;