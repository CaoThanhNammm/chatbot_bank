import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex justify-start mb-4">      
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm max-w-xs">
        <div className="flex items-center space-x-1">
          <span className="text-gray-500 text-sm mr-2">VietBank đang suy nghĩ</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
