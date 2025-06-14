import React, { useState, useCallback, useEffect } from 'react';
import { IoMenuOutline, IoCloseOutline } from 'react-icons/io5';
import { Button, ChatHeader, ChatWindow, ChatInput, SidePanel, SettingsModal, ChatHistoryModal } from '../components';
import { mockMessages } from '../data/mockData';
import { saveConversationToHistory } from '../utils/chatHistory';
import { conversationManager } from '../utils/conversationManager';
import useBankChatbot from '../utils/useBankChatbot';

const ChatPage = () => {
  const [messages, setMessages] = useState(mockMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [defaultAccountId, setDefaultAccountId] = useState('VB123456789');
  
  // Banking-specific fallback responses
  const getBankingResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('số dư') || lowerMessage.includes('kiểm tra tài khoản')) {
      return "Số dư tài khoản hiện tại của bạn là 125,750,000 VNĐ. Bạn có thể kiểm tra chi tiết giao dịch qua ứng dụng VietBank Mobile hoặc Internet Banking.";
    }
    
    if (lowerMessage.includes('chuyển tiền') || lowerMessage.includes('chuyển khoản')) {
      return "VietBank hỗ trợ chuyển tiền 24/7:\n• Trong hệ thống VietBank: Miễn phí\n• Ngân hàng khác: 11,000 VNĐ/giao dịch\n• Chuyển tiền quốc tế: Liên hệ hotline 1900 123456\n\nBạn cần hỗ trợ chuyển tiền đến đâu?";
    }
    
    if (lowerMessage.includes('lãi suất') || lowerMessage.includes('tiết kiệm')) {
      return "Lãi suất tiết kiệm VietBank hiện tại:\n• Không kỳ hạn: 4.5%/năm\n• 6 tháng: 6.2%/năm\n• 12 tháng: 6.8%/năm\n• 24 tháng: 7.2%/năm\n\nGửi từ 100 triệu có mức lãi ưu đãi thêm 0.2%. Bạn muốn tôi tư vấn gói tiết kiệm phù hợp?";
    }
    
    if (lowerMessage.includes('vay') || lowerMessage.includes('tín dụng')) {
      return "VietBank có các sản phẩm vay:\n• Vay mua nhà: 8.5-12%/năm\n• Vay tiêu dùng: 15-18%/năm\n• Vay thế chấp: 10-14%/năm\n• Thẻ tín dụng: 20-25%/năm\n\nĐiều kiện: Thu nhập tối thiểu 8 triệu/tháng. Bạn quan tâm loại vay nào?";
    }
    
    if (lowerMessage.includes('thẻ') || lowerMessage.includes('card')) {
      return "Thẻ VietBank:\n• Thẻ ghi nợ: Miễn phí năm đầu\n• Thẻ tín dụng Classic: Phí 200k/năm\n• Thẻ Gold: Phí 500k/năm\n• Thẻ Platinum: Phí 1,2tr/năm\n\nThủ tục: CMND + Giấy tờ thu nhập. Duyệt trong 24h. Bạn muốn làm loại thẻ nào?";
    }
    
    // Default banking response
    return `Tôi hiểu bạn đang hỏi về "${message}". Với tư cách là trợ lý AI của VietBank, tôi có thể hỗ trợ bạn về:\n\n• Dịch vụ ngân hàng cơ bản\n• Tư vấn sản phẩm tài chính\n• Hướng dẫn thủ tục\n• Giải đáp thắc mắc\n\nBạn có thể hỏi cụ thể hơn hoặc gọi hotline 1900 123456 để được hỗ trợ trực tiếp.`;
  };
  
  const handleSendMessage = useCallback(async (messageText) => {
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    try {
      // Use conversation manager to send message
      const result = await conversationManager.sendMessage(messageText, currentConversationId);
      
      if (result.success) {
        setMessages(prev => [...prev, result.botMessage]);
        
        // Update conversation ID if new conversation
        if (result.conversationId && !currentConversationId) {
          setCurrentConversationId(result.conversationId);
        }
      } else {
        throw new Error(result.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback to simulated response
      const botResponse = {
        id: Date.now() + 1,
        text: getBankingResponse(messageText),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
    }
    
    setIsTyping(false);
  }, [currentConversationId]);

  // Load conversation history
  const loadConversationHistory = useCallback(async () => {
    try {
      const conversations = await conversationManager.loadConversations();
      console.log('Loaded conversations:', conversations);
      // You can update state here if needed for conversation list
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  }, []);

  const handlePromptSelect = useCallback((prompt) => {
    handleSendMessage(prompt);
    setIsSidePanelOpen(false);
  }, [handleSendMessage]);
  const handleNewChat = useCallback(() => {
    // Save current conversation to history if it has messages
    if (messages.length > 0) {
      saveConversationToHistory(messages);
    }
    
    setMessages([]);
    setIsTyping(false);
    setIsSidePanelOpen(false);
    setCurrentConversationId(null);
  }, [messages]);  const handleSelectConversation = useCallback((conversation) => {
    console.log('Selecting conversation:', conversation); // Debug log
    
    // Save current conversation before switching
    if (messages.length > 0 && currentConversationId !== conversation.id) {
      saveConversationToHistory(messages);
    }
    
    // Ensure message timestamps are Date objects
    const messagesWithValidTimestamps = conversation.messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
    }));
    
    setMessages(messagesWithValidTimestamps);
    setCurrentConversationId(conversation.id);
    setIsSidePanelOpen(false);
    setIsHistoryOpen(false); // Close history modal
  }, [messages, currentConversationId]);
  // Load conversations from API on component mount
  useEffect(() => {
    loadConversationHistory();
  }, [loadConversationHistory]);

  // Auto-save conversation when user is inactive for 30 seconds
  useEffect(() => {
    if (messages.length === 0) return;

    const timer = setTimeout(() => {
      saveConversationToHistory(messages);
    }, 30000); // 30 seconds

    return () => clearTimeout(timer);
  }, [messages]);

  return (
    <div className="flex h-screen bg-off-white">      {/* Side Panel */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onPromptSelect={handlePromptSelect}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
      />
      
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">        {/* Header */}        
        <div className="relative">
          <ChatHeader 
            onSettingsClick={() => setIsSettingsOpen(true)}
            onHistoryClick={() => setIsHistoryOpen(true)}
          />
          
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="absolute p-2 transform -translate-y-1/2 left-4 top-1/2 lg:hidden"
            aria-label="Toggle menu"
          >
            {isSidePanelOpen ? (
              <IoCloseOutline size={20} />
            ) : (
              <IoMenuOutline size={20} />
            )}
          </Button>
        </div>
        
        {/* Chat Window */}
        <ChatWindow messages={messages} isTyping={isTyping} />
        
        {/* Chat Input */}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isTyping}
        />
      </div>
        {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />        {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectConversation={handleSelectConversation}
      />
    </div>
  );
};

export default ChatPage;
