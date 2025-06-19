import React, { useState, useRef, useEffect } from 'react';
import { IoSend, IoMicOutline } from 'react-icons/io5';
import Button from '../ui/Button';

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  // Focus input when component mounts
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Focus input when disabled state changes from true to false (bot finished responding)
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  }, [disabled]);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      // Focus back to input after sending message
      setTimeout(() => {
        if (textareaRef.current && !disabled) {
          textareaRef.current.focus();
        }
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };  return (
    <div className="bg-red-50 border-t border-red-200 px-4 py-4 sticky bottom-0">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          {/* Voice input button */}          <Button
            variant="ghost"
            size="sm"
            className="p-3 hover:bg-red-100 rounded-full flex-shrink-0"
            aria-label="Nhập bằng giọng nói"
            disabled={disabled}
          >
            <IoMicOutline size={18} className="text-red-700" />
          </Button>
          
                    {/* Text input container */}
          <div className="flex-1 relative">            <div className="relative flex items-center bg-red-100 border border-red-300 rounded-2xl px-4 py-3 focus-within:border-red-500 focus-within:bg-white transition-all duration-200">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi về dịch vụ ngân hàng..."
                disabled={disabled}
                className="flex-1 bg-transparent text-red-900 placeholder-red-600 resize-none border-none outline-none min-h-[24px] max-h-[120px] disabled:cursor-not-allowed"
                rows={1}
              />
              
              {/* Send button */}              <Button
                onClick={handleSend}
                disabled={!message.trim() || disabled}
                variant="primary"
                size="sm"
                className="ml-3 p-2 rounded-xl flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white border-none"
                aria-label="Gửi tin nhắn"
              >
                <IoSend size={16} />
              </Button>
            </div>
          </div>
        </div>        {/* Helper text */}
        <div className="text-xs text-red-700 text-center mt-2">
          Nhấn Enter để gửi, Shift+Enter để xuống dòng
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
