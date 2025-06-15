import React, { useState, useCallback, useEffect } from 'react';
import { IoMenuOutline, IoCloseOutline } from 'react-icons/io5';
import { Button, ChatHeader, ChatWindow, ChatInput, SidePanel, SettingsModal, ChatHistoryModal, ChatPrefix } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../hooks/useConversations';
import { chatApi } from '../utils/api';

const ChatPage = () => {
  const { user, authenticated, loading } = useAuth();
  const {
    conversations,
    currentConversation,
    currentMessages,
    loading: conversationsLoading,
    error: conversationsError,
    createConversation,
    selectConversation,
    addMessageToConversation,
    deleteConversation,
    startNewConversation,
    setCurrentMessages,
    setCurrentConversation
  } = useConversations();
  
  const [isTyping, setIsTyping] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); // Will be set based on screen size
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

  // Show loading while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // This shouldn't happen due to ProtectedRoute, but just in case
  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-off-white">
        <div className="text-center">
          <p className="text-red-600 mb-4">Bạn cần đăng nhập để truy cập trang này</p>
          <a href="/login" className="text-primary hover:underline">Đăng nhập</a>
        </div>
      </div>
    );
  }

  // Set sidebar visibility based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsSidePanelOpen(true);
      } else {
        setIsSidePanelOpen(false);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Banking-specific fallback responses
  const getBankingResponse = useCallback((message) => {
    const lowerMessage = message.toLowerCase();
    const userName = user?.name || user?.first_name || 'Khách hàng';
    const userBalance = user?.balance || '125,750,000';
    
    if (lowerMessage.includes('số dư') || lowerMessage.includes('kiểm tra tài khoản')) {
      return `Xin chào ${userName}! Số dư tài khoản hiện tại của bạn là ${userBalance} VNĐ. Bạn có thể kiểm tra chi tiết giao dịch qua ứng dụng VietBank Mobile hoặc Internet Banking.`;
    }
    
    if (lowerMessage.includes('chuyển khoản') || lowerMessage.includes('chuyển tiền')) {
      return `${userName}, để thực hiện chuyển khoản, bạn vui lòng sử dụng ứng dụng VietBank Mobile hoặc Internet Banking để đảm bảo an toàn. Bạn có cần hướng dẫn chi tiết không?`;
    }
    
    if (lowerMessage.includes('lãi suất') || lowerMessage.includes('gửi tiết kiệm')) {
      return `${userName}, lãi suất tiết kiệm hiện tại của VietBank từ 4.5% - 6.8%/năm tùy theo kỳ hạn. Bạn có muốn biết thêm chi tiết về các gói tiết kiệm không?`;
    }
    
    // Default response
    return `Xin chào ${userName}! Tôi là trợ lý ảo của VietBank. Tôi có thể giúp bạn kiểm tra số dư, hướng dẫn chuyển khoản, tư vấn sản phẩm và nhiều dịch vụ khác. Bạn cần hỗ trợ gì?`;
  }, [user]);

  const handleSendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    // Add user message optimistically to UI
    const userMessage = {
      id: Date.now(),
      text: messageText,
      isBot: false,
      timestamp: new Date()
    };

    setCurrentMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    try {
      let conversationToUse = currentConversation;
      
      // If this is the first message (no current conversation), create a new one
      if (!currentConversation && authenticated) {
        try {
          setIsCreatingConversation(true);
          
          // Generate title from first message (first 50 characters)
          const conversationTitle = messageText.length > 50 
            ? messageText.substring(0, 50) + '...' 
            : messageText;
          
          const newConversation = await createConversation(conversationTitle);
          if (newConversation) {
            conversationToUse = newConversation;
            // Set as current conversation immediately for UI consistency
            setCurrentConversation(newConversation);
            console.log('New conversation created and set as current:', newConversation);
            
            // On mobile, briefly show sidebar to indicate new conversation was created
            if (window.innerWidth < 1024) {
              setIsSidePanelOpen(true);
              setTimeout(() => {
                setIsSidePanelOpen(false);
              }, 2000); // Show for 2 seconds
            }
          }
        } catch (convError) {
          console.warn('Failed to create conversation:', convError);
          // Continue with simple chat mode if conversation creation fails
        } finally {
          setIsCreatingConversation(false);
        }
      }

      // Save user message to conversation if we have one
      if (conversationToUse && authenticated) {
        try {
          await addMessageToConversation(conversationToUse.id, 'user', messageText);
        } catch (msgError) {
          console.warn('Failed to save user message to conversation:', msgError);
        }
      }

      // Try to get AI response via new simple API
      let botResponseText;
      try {
        const response = await chatApi.sendSimpleMessage(messageText);
        
        if (response.success && response.data.response) {
          botResponseText = response.data.response;
        } else {
          throw new Error('No AI response received');
        }
      } catch (apiError) {
        console.warn('AI API failed, using fallback response:', apiError);
        
        // Use fallback banking response
        botResponseText = getBankingResponse(messageText);
      }

      // Add AI response to UI
      const botMessage = {
        id: Date.now() + 1,
        text: botResponseText,
        isBot: true,
        timestamp: new Date()
      };
      setCurrentMessages(prev => [...prev, botMessage]);

      // Save bot response to conversation if we have one
      if (conversationToUse && authenticated) {
        try {
          await addMessageToConversation(conversationToUse.id, 'assistant', botResponseText);
        } catch (msgError) {
          console.warn('Failed to save bot message to conversation:', msgError);
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic user message and show error
      setCurrentMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
        isBot: true,
        timestamp: new Date()
      };
      setCurrentMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [getBankingResponse, setCurrentMessages, currentConversation, authenticated, createConversation, conversations, selectConversation, addMessageToConversation]);

  const handleNewChat = useCallback(() => {
    // Start a new conversation
    startNewConversation();
    setIsTyping(false);
    setIsSidePanelOpen(false);
  }, [startNewConversation]);

  // Handle conversation selection
  const handleSelectConversation = useCallback(async (conversation) => {
    try {
      console.log('ChatPage: Selecting conversation:', conversation);
      
      // Stop any current typing indicator
      setIsTyping(false);
      
      // Select the conversation and load its messages
      await selectConversation(conversation);
      
      // Close modals and sidebar on mobile
      setIsHistoryOpen(false);
      if (window.innerWidth < 1024) {
        setIsSidePanelOpen(false);
      }
      
      console.log('ChatPage: Conversation selection completed');
    } catch (error) {
      console.error('ChatPage: Error selecting conversation:', error);
    }
  }, [selectConversation]);

  const handleDeleteConversation = useCallback(async (conversationId) => {
    try {
      const success = await deleteConversation(conversationId);
      if (success) {
        console.log('Conversation deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  }, [deleteConversation]);

  // Simple chat mode - no auto-save needed

  return (
    <div className="flex h-screen bg-off-white">
      {/* Side Panel - Always visible on desktop, toggleable on mobile */}
      <div className={`${isSidePanelOpen ? 'block' : 'hidden'} lg:block`}>
        <SidePanel
          isOpen={isSidePanelOpen}
          onClose={() => setIsSidePanelOpen(false)}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          conversations={conversations}
          currentConversation={currentConversation}
          loading={conversationsLoading || isCreatingConversation}
        />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="relative">
          <ChatHeader 
            variant="chat"
            onSettingsClick={() => setIsSettingsOpen(true)}
            onHistoryClick={() => setIsHistoryOpen(true)}
          />
          
          {/* User Welcome Message */}
          <ChatPrefix user={user} />
          
          {/* Menu toggle button - visible on mobile and desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
            className="absolute p-2 transform -translate-y-1/2 left-4 top-1/2"
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
        <ChatWindow 
          messages={currentMessages} 
          isTyping={isTyping} 
          loading={conversationsLoading}
        />
        
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
      />
      
      {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectConversation={handleSelectConversation}
        conversations={conversations}
        onDeleteConversation={handleDeleteConversation}
      />
    </div>
  );
};

export default ChatPage;
