/**
 * Conversation Manager for the Bank Chatbot
 * Handles sending messages, loading conversations, and managing conversation state
 */

import { getChatHistory, saveConversationToHistory, updateConversationInHistory } from './chatHistory';
import { processBankQuery } from './bankApiService';
import { sendGuestMessage } from '../services/GuestChatService';

/**
 * Conversation Manager class
 */
class ConversationManager {
  constructor() {
    this.currentConversationId = null;
    this.isProcessing = false;
  }

  /**
   * Send a message to the chatbot and get a response
   * @param {string} messageText - The message text to send
   * @param {string|null} conversationId - Optional conversation ID
   * @param {boolean} isGuestMode - Whether this is a guest mode conversation
   * @param {Function} onChunk - Optional callback for streaming chunks
   * @returns {Promise<Object>} - Response object with botMessage and conversationId
   */
  async sendMessage(messageText, conversationId = null, isGuestMode = false, onChunk = null) {
    if (this.isProcessing) {
      return {
        success: false,
        error: 'A message is already being processed'
      };
    }

    this.isProcessing = true;
    this.currentConversationId = conversationId || this.currentConversationId;

    try {
      let responseText;
      
      if (isGuestMode) {
        // Use the new guest chat API with streaming support
        try {
          if (onChunk && typeof onChunk === 'function') {
            // Streaming mode - return early and let the callback handle chunks
            const apiResponse = await sendGuestMessage(messageText, onChunk);
            if (apiResponse.success) {
              responseText = apiResponse.response;
            } else {
              throw new Error(apiResponse.error);
            }
          } else {
            // Non-streaming mode
            const apiResponse = await sendGuestMessage(messageText);
            if (apiResponse.success) {
              responseText = apiResponse.response;
            } else {
              throw new Error(apiResponse.error);
            }
          }
        } catch (error) {
          console.error('Guest chat API error:', error);
          // Fallback to general response if API fails
          responseText = this.getGuestFallbackResponse(messageText);
        }
      } else {
        // Original logic for authenticated users
        // Try to process as a bank query first
        const bankQuery = this.detectBankQuery(messageText);
        
        if (bankQuery) {
          try {
            // Process bank-specific query
            const response = await processBankQuery(bankQuery, 'current-user', 'default-account');
            responseText = response.response || this.getBankingFallbackResponse(messageText);
          } catch (error) {
            console.error('Error processing bank query:', error);
            responseText = this.getBankingFallbackResponse(messageText);
          }
        } else {
          // General chatbot response
          responseText = this.getGeneralResponse(messageText);
        }
        
        // Simulate API delay for non-guest mode
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Create bot message object
      const botMessage = {
        id: Date.now(),
        text: responseText,
        isBot: true,
        timestamp: new Date()
      };

      // Generate a new conversation ID if needed
      if (!this.currentConversationId) {
        this.currentConversationId = Date.now().toString();
      }

      return {
        success: true,
        botMessage,
        conversationId: this.currentConversationId
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error.message || 'Failed to get response'
      };
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Load all conversations from history
   * @returns {Promise<Array>} - Array of conversation objects
   */
  async loadConversations() {
    try {
      // In a real implementation, this might fetch from an API
      // For now, we'll use the local storage implementation
      return getChatHistory();
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Get a specific conversation by ID
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Object|null>} - Conversation object or null if not found
   */
  async getConversation(conversationId) {
    try {
      const conversations = await this.loadConversations();
      return conversations.find(conv => conv.id === conversationId) || null;
    } catch (error) {
      console.error('Error getting conversation:', error);
      return null;
    }
  }

  /**
   * Detect if a message is a bank-related query
   * @param {string} message - User message
   * @returns {Object|null} - Query object or null if not a bank query
   */
  detectBankQuery(message) {
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
      };
    }
    
    // Transfer query
    if (
      lowerMessage.includes('chuyển tiền') || 
      lowerMessage.includes('chuyển khoản')
    ) {
      return {
        type: 'transfer',
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
      };
    }
    
    // Not a bank query
    return null;
  }

  /**
   * Get a fallback banking response for when API calls fail
   * @param {string} message - The user's message
   * @returns {string} - A fallback response
   */
  getBankingFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('số dư') || lowerMessage.includes('kiểm tra tài khoản')) {
      return "Số dư tài khoản hiện tại của bạn là 125,750,000 VNĐ. Bạn có thể kiểm tra chi tiết giao dịch qua ứng dụng AGRIBANK Mobile hoặc Internet Banking.";
    }
    
    if (lowerMessage.includes('chuyển tiền') || lowerMessage.includes('chuyển khoản')) {
      return "AGRIBANK hỗ trợ chuyển tiền 24/7:\n• Trong hệ thống AGRIBANK: Miễn phí\n• Ngân hàng khác: 11,000 VNĐ/giao dịch\n• Chuyển tiền quốc tế: Liên hệ hotline 1900 123456\n\nBạn cần hỗ trợ chuyển tiền đến đâu?";
    }
    
    if (lowerMessage.includes('lãi suất') || lowerMessage.includes('tiết kiệm')) {
      return "Lãi suất tiết kiệm AGRIBANK hiện tại:\n• Không kỳ hạn: 4.5%/năm\n• 6 tháng: 6.2%/năm\n• 12 tháng: 6.8%/năm\n• 24 tháng: 7.2%/năm\n\nGửi từ 100 triệu có mức lãi ưu đãi thêm 0.2%. Bạn muốn tôi tư vấn gói tiết kiệm phù hợp?";
    }
    
    if (lowerMessage.includes('vay') || lowerMessage.includes('tín dụng')) {
      return "AGRIBANK có các sản phẩm vay:\n• Vay mua nhà: 8.5-12%/năm\n• Vay tiêu dùng: 15-18%/năm\n• Vay thế chấp: 10-14%/năm\n• Thẻ tín dụng: 20-25%/năm\n\nĐiều kiện: Thu nhập tối thiểu 8 triệu/tháng. Bạn quan tâm loại vay nào?";
    }
    
    if (lowerMessage.includes('thẻ') || lowerMessage.includes('card')) {
      return "Thẻ AGRIBANK:\n• Thẻ ghi nợ: Miễn phí năm đầu\n• Thẻ tín dụng Classic: Phí 200k/năm\n• Thẻ Gold: Phí 500k/năm\n• Thẻ Platinum: Phí 1,2tr/năm\n\nThủ tục: CMND + Giấy tờ thu nhập. Duyệt trong 24h. Bạn muốn làm loại thẻ nào?";
    }
    
    // Default banking response
    return `Tôi hiểu bạn đang hỏi về "${message}". Với tư cách là trợ lý AI của AGRIBANK, tôi có thể hỗ trợ bạn về:\n\n• Dịch vụ ngân hàng cơ bản\n• Tư vấn sản phẩm tài chính\n• Hướng dẫn thủ tục\n• Giải đáp thắc mắc\n\nBạn có thể hỏi cụ thể hơn hoặc gọi hotline 1900 123456 để được hỗ trợ trực tiếp.`;
  }

  /**
   * Get a general response for non-banking queries
   * @param {string} message - The user's message
   * @returns {string} - A general response
   */
  getGeneralResponse(message) {
    // Simple responses for common greetings
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('xin chào') || lowerMessage.includes('chào') || lowerMessage === 'hi' || lowerMessage === 'hello') {
      return "Xin chào! Tôi là trợ lý ảo của AGRIBANK. Tôi có thể giúp gì cho bạn hôm nay?";
    }
    
    if (lowerMessage.includes('cảm ơn')) {
      return "Không có gì! Rất vui được hỗ trợ bạn. Bạn cần giúp đỡ gì thêm không?";
    }
    
    if (lowerMessage.includes('tạm biệt') || lowerMessage.includes('bye')) {
      return "Tạm biệt! Chúc bạn một ngày tốt lành. Hẹn gặp lại!";
    }
    
    // Default response for other queries
    return "Tôi hiểu bạn đang hỏi về \"" + message + "\". Tôi đang học hỏi để trả lời tốt hơn. Bạn có thể hỏi tôi về các dịch vụ ngân hàng như kiểm tra số dư, chuyển khoản, lãi suất tiết kiệm, hoặc thông tin thẻ tín dụng.";
  }

  /**
   * Get a fallback response for guest mode when API fails
   * @param {string} message - The user's message
   * @returns {string} - A fallback response
   */
  getGuestFallbackResponse(message) {
    return "Xin lỗi, tôi đang gặp sự cố kết nối với hệ thống. Vui lòng thử lại sau hoặc liên hệ với chúng tôi qua hotline 1900 123456 để được hỗ trợ trực tiếp.";
  }
}

// Create and export a singleton instance
export const conversationManager = new ConversationManager();

// Export default for convenience
export default conversationManager;