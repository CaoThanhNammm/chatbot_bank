import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoMenuOutline, IoCloseOutline, IoLogInOutline } from 'react-icons/io5';
import { Button, ChatHeader, ChatWindow, ChatInput, SettingsModal } from '../components';
import SidePanel from '../components/Chat/SidePanel';
import { conversationManager } from '../utils/conversationManager';
import { useStreamingMessage } from '../hooks/useStreamingMessage';
import { 
  saveCurrentConversation, 
  getGuestConversations, 
  getGuestConversation,
  clearGuestConversations,
  getCurrentConversation
} from '../utils/guestChatHistory';

// Constants for local storage keys
const GUEST_MESSAGES_KEY = 'guestChatMessages';
const GUEST_SESSION_KEY = 'guestSessionId';

/**
 * GuestChatPage - A version of the chat interface that doesn't require login
 * Provides limited functionality compared to the authenticated ChatPage
 */
const GuestChatPage = () => {
  const defaultWelcomeMessage = {
    id: 1,
    text: "Xin chào! Tôi là trợ lý ảo của AGRIBANK. Bạn có thể hỏi tôi về các sản phẩm và dịch vụ ngân hàng. Lưu ý rằng đây là phiên trò chuyện khách, các thông tin cá nhân và lịch sử trò chuyện sẽ được lưu trữ cục bộ trên trình duyệt của bạn.",
    isBot: true,
    timestamp: new Date()
  };

  // Initialize messages from current conversation or use default welcome message
  const [messages, setMessages] = useState(() => {
    // Try to get current conversation first
    const currentConversation = getCurrentConversation();
    if (currentConversation && currentConversation.messages && currentConversation.messages.length > 0) {
      try {
        // Convert timestamp strings back to Date objects
        return currentConversation.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing current conversation:', error);
      }
    }
    
    // Fall back to legacy storage if no current conversation
    const savedMessages = localStorage.getItem(GUEST_MESSAGES_KEY);
    if (savedMessages) {
      try {
        // Parse the saved messages and convert timestamp strings back to Date objects
        const parsedMessages = JSON.parse(savedMessages);
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
    
    // Default to welcome message if nothing else works
    return [defaultWelcomeMessage];
  });

  const [isTyping, setIsTyping] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Use streaming message hook for optimized performance like ChatPage
  const { startStreaming, updateStreamingContent, finishStreaming } = useStreamingMessage();

  // Initialize guest session
  useEffect(() => {
    // First try to get session ID from current conversation
    const currentConversation = getCurrentConversation();
    if (currentConversation && currentConversation.id) {
      setSessionId(currentConversation.id);
      return;
    }
    
    // Fall back to legacy storage
    const savedSessionId = localStorage.getItem(GUEST_SESSION_KEY);
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      // Generate a new session ID if none exists
      const newSessionId = `guest-${Date.now()}`;
      setSessionId(newSessionId);
      localStorage.setItem(GUEST_SESSION_KEY, newSessionId);
    }
  }, []);
  
  // Save messages to local storage and update conversation history whenever they change
  useEffect(() => {
    localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify(messages));
    
    // Only save to conversation history if there's more than just the welcome message
    if (messages.length > 1) {
      saveCurrentConversation(messages, sessionId);
    }
  }, [messages, sessionId]);

  const handleSendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message optimistically to UI
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Declare variables for error handling
    let botMessageId = Date.now() + 1;
    let botResponseText = '';

    try {
      // Add empty bot message to UI for streaming
      const botMessage = {
        id: botMessageId,
        text: '',
        isBot: true,
        timestamp: new Date(),
        isStreaming: true
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Start streaming with optimized hook
      startStreaming(botMessageId);

      // Use conversation manager with streaming support
      const result = await conversationManager.sendMessage(
        messageText, 
        sessionId, 
        true, // isGuestMode
        (chunk) => {
          // Update bot message with new chunk using the streaming hook
          updateStreamingContent(chunk, setMessages);
          botResponseText += chunk;
        }
      );
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to get response');
      }
      
      // Ensure we have the complete response and mark as finished
      if (result.botMessage && result.botMessage.text && result.botMessage.text !== botResponseText) {
        botResponseText = result.botMessage.text;
      }
      
      // Mark streaming as finished - formatting will be done in finishStreaming
      finishStreaming(setMessages, botResponseText);
      
    } catch (error) {
      console.error('Chat error:', error);
      
      // Remove the empty bot message and add error message
      setMessages(prev => prev.filter(msg => msg.id !== botMessageId));
      
      // Fallback response
      const errorResponse = {
        id: Date.now() + 2,
        text: "Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau hoặc liên hệ với chúng tôi qua hotline 1900 123456.",
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId, startStreaming, updateStreamingContent, finishStreaming]);

  const handlePromptSelect = useCallback((prompt) => {
    handleSendMessage(prompt);
    setIsSidePanelOpen(false);
  }, [handleSendMessage]);

  const handleNewChat = useCallback(() => {
    const welcomeMessage = {
      id: Date.now(),
      text: "Xin chào! Tôi là trợ lý ảo của AGRIBANK. Bạn có thể hỏi tôi về các sản phẩm và dịch vụ ngân hàng. Lưu ý rằng đây là phiên trò chuyện khách, các thông tin cá nhân và lịch sử trò chuyện sẽ được lưu trữ cục bộ trên trình duyệt của bạn.",
      isBot: true,
      timestamp: new Date()
    };
    
    // Reset messages to just the welcome message
    setMessages([welcomeMessage]);
    setIsTyping(false);
    setIsSidePanelOpen(false);
    
    // Generate a new session ID
    const newSessionId = `guest-${Date.now()}`;
    setSessionId(newSessionId);
    
    // Update local storage with new session ID and reset messages
    localStorage.setItem(GUEST_SESSION_KEY, newSessionId);
    localStorage.setItem(GUEST_MESSAGES_KEY, JSON.stringify([welcomeMessage]));
  }, []);
  
  // Function to clear all chat history from local storage
  const clearChatHistory = useCallback(() => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện không? Hành động này không thể hoàn tác.')) {
      clearGuestConversations();
      handleNewChat();
    }
  }, [handleNewChat]);
  
  // Function to handle selecting a previous conversation
  const handleSelectConversation = useCallback((conversation) => {
    if (!conversation || !conversation.id) return;
    
    // Get the full conversation with messages
    const fullConversation = getGuestConversation(conversation.id);
    if (!fullConversation) return;
    
    // Set the session ID to the conversation ID
    setSessionId(fullConversation.id);
    
    // Convert timestamps back to Date objects
    const messagesWithDates = fullConversation.messages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    
    // Load the messages
    setMessages(messagesWithDates);
    setIsSidePanelOpen(false);
  }, []);

  return (
    <div className="flex h-screen bg-off-white">
      {/* Side Panel - Limited functionality for guests */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onPromptSelect={handlePromptSelect}
        onNewChat={handleNewChat}
        onClearHistory={clearChatHistory}
        onSelectConversation={handleSelectConversation}
        isGuestMode={true} // Flag to indicate guest mode
      />
      
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header with Login Button */}
        <div className="relative">
          <ChatHeader 
            variant="chat"
            onSettingsClick={() => setIsSettingsOpen(true)}
            isGuestMode={true}
            rightElement={
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center"
                >
                  <IoLogInOutline size={18} className="mr-1" />
                  Đăng nhập
                </Button>
              </Link>
            }
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
        
        {/* Guest Mode Banner */}
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 text-sm text-blue-700 flex justify-between items-center">
          <div>
            <span className="font-medium">Chế độ khách</span> - Lịch sử trò chuyện được lưu trên trình duyệt. Đăng nhập để nhận hỗ trợ cá nhân hóa và đồng bộ trên nhiều thiết bị
          </div>
          <Link to="/login">
            <Button size="xs" variant="primary">Đăng nhập</Button>
          </Link>
        </div>
        
        {/* Chat Window */}
        <ChatWindow messages={messages} isTyping={isTyping} />
        
        {/* Chat Input */}
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={isTyping}
        />
      </div>
      
      {/* Settings Modal - Limited settings for guests */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isGuestMode={true}
      />
    </div>
  );
};

export default GuestChatPage;