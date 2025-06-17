import React from 'react';

const MessageBubble = ({ message, isBot, timestamp }) => {
  const formatTime = (timestamp) => {
    try {
      // Ensure timestamp is a valid Date object
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Vừa xong';
      }
      
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Vừa xong';
    }
  };
  
  const formatMessage = (text) => {
    // Simple markdown-like formatting for bold text
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line.split('**').map((part, i) => 
          i % 2 === 1 ? <strong key={i}>{part}</strong> : part
        )}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };
  
  return (
    <div className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-4 message-enter`}>
      <div 
        className={`
          max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl
          px-4 py-3 rounded-2xl shadow-sm
          ${isBot 
            ? 'bg-white text-charcoal mr-auto border border-gray-100' 
            : 'bg-charcoal text-white ml-auto'
          }
        `.trim().replace(/\s+/g, ' ')}
      >
        <div className="text-sm leading-relaxed font-body">
          {formatMessage(message)}
        </div>
        <div 
          className={`
            text-xs mt-2 opacity-70
            ${isBot ? 'text-gray-500' : 'text-gray-300'}
          `.trim()}
        >
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
