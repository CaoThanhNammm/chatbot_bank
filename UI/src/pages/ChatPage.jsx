import React, { useState, useCallback, useEffect } from 'react';
import { IoMenuOutline, IoAdd, IoTrashOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { Button, ChatWindow, ChatInput, SidePanel } from '../components';
import { ConfirmationModal, Toast } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useConversations } from '../hooks/useConversations';
import { useStreamingMessage } from '../hooks/useStreamingMessage';
import { chatApi } from '../utils/api';
import agribankLogo from '../assets/icon.jpg';

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
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false); // Always start closed
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isClearingConversation, setIsClearingConversation] = useState(false);
  
  // Use streaming message hook for optimized performance
  const { startStreaming, updateStreamingContent, finishStreaming } = useStreamingMessage();

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

  // Sidebar is always hidden by default and controlled by toggle button only
  
  // Banking-specific fallback responses
  const getBankingResponse = useCallback((message) => {
    const lowerMessage = message.toLowerCase();
    const userName = user?.name || user?.first_name || 'Khách hàng';
    const userBalance = user?.balance || '125,750,000';
    
    if (lowerMessage.includes('số dư') || lowerMessage.includes('kiểm tra tài khoản')) {
      return `Xin chào ${userName}! Số dư tài khoản hiện tại của bạn là ${userBalance} VNĐ. Bạn có thể kiểm tra chi tiết giao dịch qua ứng dụng AGRIBANK Mobile hoặc Internet Banking.`;
    }
    
    if (lowerMessage.includes('chuyển khoản') || lowerMessage.includes('chuyển tiền')) {
      return `${userName}, để thực hiện chuyển khoản, bạn vui lòng sử dụng ứng dụng AGRIBANK Mobile hoặc Internet Banking để đảm bảo an toàn. Bạn có cần hướng dẫn chi tiết không?`;
    }
    
    if (lowerMessage.includes('lãi suất') || lowerMessage.includes('gửi tiết kiệm')) {
      return `${userName}, lãi suất tiết kiệm hiện tại của AGRIBANK từ 4.5% - 6.8%/năm tùy theo kỳ hạn. Bạn có muốn biết thêm chi tiết về các gói tiết kiệm không?`;
    }
    
    // Default response
    return `Xin chào ${userName}! Tôi là trợ lý ảo của AGRIBANK. Tôi có thể giúp bạn kiểm tra số dư, hướng dẫn chuyển khoản, tư vấn sản phẩm và nhiều dịch vụ khác. Bạn cần hỗ trợ gì?`;
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

    // Declare variables for error handling
    let botMessageId = Date.now() + 1;
    let botResponseText = '';

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
            
            // No need to show sidebar since the new chat button is now outside
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

      // Try to get AI response via streaming API
      
      // Add empty bot message to UI for streaming
      const botMessage = {
        id: botMessageId,
        text: '',
        isBot: true,
        timestamp: new Date(),
        isStreaming: true
      };
      setCurrentMessages(prev => [...prev, botMessage]);
      
      // Start streaming with optimized hook
      startStreaming(botMessageId);

      try {
        // Handle streaming response
        const response = await chatApi.sendSimpleMessage(messageText, (chunk) => {
          // Update bot message with new chunk using optimized hook
          updateStreamingContent(chunk, setCurrentMessages);
          botResponseText += chunk;
        });
        
        if (!response.success) {
          throw new Error(response.error || 'No AI response received');
        }
        
        // Ensure we have the complete response and mark as finished
        if (response.data && response.data.response && response.data.response !== botResponseText) {
          botResponseText = response.data.response;
        }
        
        // Mark streaming as finished using optimized hook
        finishStreaming(setCurrentMessages, botResponseText);
        
      } catch (apiError) {
        console.warn('AI API failed, using fallback response:', apiError);
        
        // Use fallback banking response
        botResponseText = getBankingResponse(messageText);
        
        // Update the bot message with fallback response using optimized hook
        finishStreaming(setCurrentMessages, botResponseText);
      }

      // Save bot response to conversation if we have one
      if (conversationToUse && authenticated && botResponseText) {
        try {
          await addMessageToConversation(conversationToUse.id, 'assistant', botResponseText);
        } catch (msgError) {
          console.warn('Failed to save bot message to conversation:', msgError);
        }
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic user message and any bot message
      setCurrentMessages(prev => prev.filter(msg => msg.id !== userMessage.id && msg.id !== botMessageId));
      
      // Add error message
      const errorMessage = {
        id: Date.now() + 2,
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
      
      // Close sidebar after selecting conversation
      setIsSidePanelOpen(false);
      
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

  const handleClearConversation = useCallback(() => {
    setShowClearConfirmModal(true);
  }, []);

  const handleConfirmClear = useCallback(async () => {
    setIsClearingConversation(true);
    
    try {
      if (!currentConversation) {
        // If no conversation, just clear current messages
        setCurrentMessages([]);
        setShowClearConfirmModal(false);
        setShowSuccessToast(true);
        return;
      }

      // Call API to clear conversation
      const response = await chatApi.clearConversation(currentConversation.id);
      if (response.success) {
        // Clear messages in UI
        setCurrentMessages([]);
        setShowClearConfirmModal(false);
        setShowSuccessToast(true);
        console.log('Conversation cleared successfully');
      } else {
        console.error('Failed to clear conversation:', response.error);
        alert('Có lỗi xảy ra khi xóa tin nhắn. Vui lòng thử lại.');
        setShowClearConfirmModal(false);
      }
    } catch (error) {
      console.error('Error clearing conversation:', error);
      alert('Có lỗi xảy ra khi xóa tin nhắn. Vui lòng thử lại.');
      setShowClearConfirmModal(false);
    } finally {
      setIsClearingConversation(false);
    }
  }, [currentConversation, setCurrentMessages]);

  // Simple chat mode - no auto-save needed

  return (
    <div className="flex h-screen bg-off-white">
      {/* Side Panel - Always hidden by default, slides out when toggled */}
      <SidePanel
        isOpen={isSidePanelOpen}
        onClose={() => setIsSidePanelOpen(false)}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        conversations={conversations}
        currentConversation={currentConversation}
        loading={conversationsLoading || isCreatingConversation}
      />
      
      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header Area - Minimal */}
        <div className="relative bg-white border-b border-gray-200 p-4">
          {/* Left side buttons */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 z-10">
            {/* Menu toggle button */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 hover:scale-105 ${
                  isSidePanelOpen ? 'text-primary bg-blue-50' : 'text-gray-600'
                }`}
                aria-label={isSidePanelOpen ? "Đóng menu" : "Mở menu"}
              >
                <IoMenuOutline size={20} className={`transition-transform duration-200 ${isSidePanelOpen ? 'rotate-90' : ''}`} />
              </Button>
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {isSidePanelOpen ? "Đóng menu" : "Mở menu"}
              </div>
            </div>
            
            {/* New chat button */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-blue-100 hover:scale-105 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Tạo cuộc trò chuyện mới"
                disabled={isCreatingConversation}
              >
                {isCreatingConversation ? (
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <IoAdd size={20} />
                )}
              </Button>
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                {isCreatingConversation ? "Đang tạo..." : "Tạo cuộc trò chuyện mới"}
              </div>
            </div>
            
            {/* Clear conversation button */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearConversation}
                className="p-2 rounded-lg transition-all duration-200 hover:bg-red-100 hover:scale-105 text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Xóa tất cả tin nhắn"
                disabled={currentMessages.length === 0}
              >
                <IoTrashOutline size={20} />
              </Button>
              {/* Tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                Xóa tất cả tin nhắn
              </div>
            </div>
          </div>
          
          {/* Logo area */}
          <div className="flex items-center justify-center px-20">
            <Link 
              to="/" 
              className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 hover:scale-105 px-2 py-1 rounded-lg"
              aria-label="Về trang chủ"
            >
              <img 
                src={agribankLogo} 
                alt="AGRIBANK Logo" 
                className="h-8 w-auto object-contain rounded shadow-sm"
              />
              <span className="text-lg font-semibold text-gray-800 hidden sm:block">AGRIBANK</span>
            </Link>
          </div>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearConfirmModal}
        onClose={() => setShowClearConfirmModal(false)}
        onConfirm={handleConfirmClear}
        title="Xóa tất cả tin nhắn"
        message={
          currentConversation 
            ? "Bạn có chắc chắn muốn xóa tất cả tin nhắn trong cuộc trò chuyện này không? Hành động này không thể hoàn tác."
            : "Bạn có chắc chắn muốn xóa tất cả tin nhắn hiện tại không?"
        }
        confirmText="Xóa tất cả"
        cancelText="Hủy"
        type="danger"
        loading={isClearingConversation}
      />

      {/* Success Toast */}
      <Toast
        isOpen={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        title="Xóa thành công!"
        message="Tất cả tin nhắn đã được xóa thành công."
        type="success"
        duration={3000}
        position="top-right"
      />
    </div>
  );
};

export default ChatPage;
