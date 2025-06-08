import React, { useState, useEffect } from 'react';
import { IoTimeOutline, IoTrashOutline, IoSearchOutline, IoCalendarOutline } from 'react-icons/io5';
import Modal from './Modal';
import Button from './Button';

const ChatHistoryModal = ({ isOpen, onClose, onSelectConversation }) => {
  const [chatHistory, setChatHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Load chat history from localStorage
  useEffect(() => {
    const loadChatHistory = () => {
      try {
        const savedHistory = localStorage.getItem('vietbank_chat_history');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          setChatHistory(parsed);
          setFilteredHistory(parsed);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };

    if (isOpen) {
      loadChatHistory();
    }
  }, [isOpen]);

  // Filter history based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredHistory(chatHistory);
    } else {
      const filtered = chatHistory.filter(conversation =>
        conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conversation.messages.some(msg => 
          msg.text.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, chatHistory]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isYesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

    if (isToday) {
      return `Hôm nay ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isYesterday) {
      return `Hôm qua ${date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('vi-VN', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getConversationPreview = (messages) => {
    if (messages.length === 0) return 'Cuộc trò chuyện trống';
    
    const lastUserMessage = messages
      .filter(msg => !msg.isBot)
      .slice(-1)[0];
    
    if (lastUserMessage) {
      return lastUserMessage.text.length > 60 
        ? `${lastUserMessage.text.substring(0, 60)}...`
        : lastUserMessage.text;
    }
    
    return 'Chưa có tin nhắn từ người dùng';
  };

  const deleteConversation = (conversationId, e) => {
    e.stopPropagation(); // Prevent triggering the conversation selection
    
    const updatedHistory = chatHistory.filter(conv => conv.id !== conversationId);
    setChatHistory(updatedHistory);
    setFilteredHistory(updatedHistory.filter(conversation =>
      !searchQuery || 
      conversation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversation.messages.some(msg => 
        msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ));
    
    // Update localStorage
    try {
      localStorage.setItem('vietbank_chat_history', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  };

  const clearAllHistory = () => {
    setChatHistory([]);
    setFilteredHistory([]);
    localStorage.removeItem('vietbank_chat_history');
  };

  const handleSelectConversation = (conversation) => {
    onSelectConversation(conversation);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={
        <div className="flex items-center space-x-3">
          <span>Lịch sử đoạn chat</span>
        </div>
      }
      className="max-w-4xl"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <IoSearchOutline size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm trong lịch sử chat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* History List */}
        <div className="chat-history-scroll max-h-96 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <IoTimeOutline size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {searchQuery ? 'Không tìm thấy kết quả' : 'Chưa có lịch sử chat'}
              </h3>
              <p className="text-gray-400">
                {searchQuery 
                  ? 'Thử từ khóa khác để tìm kiếm' 
                  : 'Các cuộc trò chuyện của bạn sẽ được lưu tại đây'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHistory.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  className="chat-history-item p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <IoCalendarOutline size={16} className="text-gray-400" />
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {getConversationPreview(conversation.messages)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(conversation.createdAt)}
                        </span>
                        <span className="text-xs text-blue-600">
                          {conversation.messages.length} tin nhắn
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conversation.id, e)}
                      className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                      title="Xóa cuộc trò chuyện"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {chatHistory.length > 0 && (
          <div className="pt-4 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Tổng cộng: {chatHistory.length} cuộc trò chuyện
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllHistory}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <IoTrashOutline size={16} className="mr-2" />
                Xóa tất cả
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ChatHistoryModal;
