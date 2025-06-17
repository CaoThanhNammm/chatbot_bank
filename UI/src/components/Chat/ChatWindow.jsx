import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({ messages, isTyping, loading = false }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (    <div className="flex-1 overflow-y-auto px-4 py-6 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-4xl mx-auto">
        {/* Loading state */}
        {loading && messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-sage-100 to-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
            <h2 className="text-xl font-playfair font-semibold text-neutral-800 mb-2">
              Đang tải tin nhắn...
            </h2>
            <p className="text-neutral-600 max-w-md mx-auto">
              Vui lòng chờ trong giây lát
            </p>
          </div>
        )}

        {/* Welcome message when no messages and not loading */}
        {!loading && messages.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-r from-sage-100 to-ocean-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏦</span>
            </div>
            <h2 className="text-2xl font-playfair font-semibold text-neutral-800 mb-2">
              Chào mừng đến với AGRIBANK AI
            </h2>
            <p className="text-neutral-600 max-w-md mx-auto">
              Tôi là trợ lý AI của AGRIBANK, sẵn sàng hỗ trợ bạn về các dịch vụ ngân hàng, 
              tư vấn tài chính và giải đáp mọi thắc mắc. Bạn cần hỗ trợ gì hôm nay?
            </p>
          </div>
        )}
        
        {/* Messages */}
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message.text}
            isBot={message.isBot}
            timestamp={message.timestamp}
          />
        ))}
        
        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatWindow;
