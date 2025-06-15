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
    
    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        text: getBankingResponse(userMessage),
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000); // Random delay between 1.5-2.5s
  }, []);

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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
            message: messageText
        })
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success && data.response) {
        const botResponse = {
          id: Date.now() + 1,
          text: data.response.text || data.response,
          isBot: true,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Handle error response
        const errorMessage = {
          id: Date.now() + 1,
          text: data.message || "Xin lỗi, có lỗi xảy ra khi xử lý tin nhắn của bạn. Vui lòng thử lại sau.",
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      // Handle network or other errors
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.",
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
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
