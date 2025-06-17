import React, { useState, useEffect } from 'react';
import { IoTimeOutline, IoTrashOutline, IoSearchOutline, IoCalendarOutline } from 'react-icons/io5';
import Modal from './Modal';
import Button from './Button';

const ChatHistoryModal = ({ 
  isOpen, 
  onClose, 
  onSelectConversation, 
  conversations = [],
  onDeleteConversation 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);

  // Update filtered history when conversations change
  useEffect(() => {
    setFilteredHistory(conversations);
  }, [conversations]);

  // Filter history based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredHistory(conversations);
    } else {
      const filtered = conversations.filter(conversation =>
        conversation.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    }
  }, [searchQuery, conversations]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
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
    } catch {
      return '';
    }
  };

  const getConversationPreview = (conversation) => {
    // For API conversations, we use the title as preview since we don't have messages loaded
    return conversation.title.length > 60 
      ? `${conversation.title.substring(0, 60)}...`
      : conversation.title;
  };

  const deleteConversation = async (conversationId, e) => {
    e.stopPropagation(); // Prevent triggering the conversation selection
    
    try {
      if (onDeleteConversation) {
        await onDeleteConversation(conversationId);
      }
    } catch (error) {
      console.error('Error deleting conversation from history modal:', error);
    }
  };

  const clearAllHistory = () => {
    // This would need to be implemented to delete all conversations via API
    // For now, we'll just close the modal
    onClose();
  };

  const handleSelectConversation = async (conversation) => {
    try {
      // Close modal first for better UX
      onClose();
      
      // Then select conversation (this will load messages)
      if (onSelectConversation) {
        await onSelectConversation(conversation);
      }
    } catch (error) {
      console.error('Error selecting conversation from history:', error);
    }
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
                        {getConversationPreview(conversation)}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(conversation.created_at)}
                        </span>
                        <span className="text-xs text-blue-600">
                          Cuộc trò chuyện
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => deleteConversation(conversation.id, e)}
                      className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                      title="Xóa cuộc trò chuyện"
                      style={{ 
                        pointerEvents: 'auto',
                        zIndex: 10
                      }}
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
        {conversations.length > 0 && (
          <div className="pt-4 border-t border-gray-200 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Tổng cộng: {conversations.length} cuộc trò chuyện
              </span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ChatHistoryModal;
