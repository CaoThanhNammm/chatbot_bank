import React, { useState, useEffect } from 'react';
import { chatApi } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { IoTrash, IoTime, IoSearch } from 'react-icons/io5';

const ConversationsPage = () => {
  const { user, authenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredConversations, setFilteredConversations] = useState([]);

  const loadConversations = async () => {
    if (!authenticated || !user) {
      setError('User not authenticated');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await chatApi.getConversations(user.id);
      
      if (response.success) {
        let conversations = [];
        if (response.data && response.data.conversations && Array.isArray(response.data.conversations)) {
          conversations = response.data.conversations;
        } else if (response.data && Array.isArray(response.data)) {
          conversations = response.data;
        }
        
        setConversations(conversations);
        setFilteredConversations(conversations);
      } else {
        setError(response.error || 'Failed to load conversations');
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (conversationId) => {
    try {
      const response = await chatApi.deleteConversation(conversationId);
      if (response.success) {
        // Remove from local state
        const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
        setConversations(updatedConversations);
        setFilteredConversations(updatedConversations.filter(conv => 
          conv.title.toLowerCase().includes(searchQuery.toLowerCase())
        ));
      } else {
        setError('Failed to delete conversation');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      setError('Failed to delete conversation');
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conversation =>
        conversation.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredConversations(filtered);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  useEffect(() => {
    if (authenticated && user) {
      loadConversations();
    }
  }, [authenticated, user]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lịch sử trò chuyện</h1>
          <p className="text-gray-600">Vui lòng đăng nhập để xem lịch sử trò chuyện</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content - No Header/Navigation */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Lịch sử trò chuyện</h1>
          <p className="text-gray-600">Quản lý và xem lại các cuộc trò chuyện của bạn</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc trò chuyện..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Lỗi:</strong> {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-6">
            Đang tải cuộc trò chuyện...
          </div>
        )}

        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredConversations.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredConversations.map((conversation) => (
                <div key={conversation.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {conversation.title}
                      </h3>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <IoTime className="mr-1" size={16} />
                        <span>{formatDate(conversation.updated_at)}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <button
                        onClick={() => deleteConversation(conversation.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa cuộc trò chuyện"
                      >
                        <IoTrash size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <IoTime size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện nào'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Thử tìm kiếm với từ khóa khác' 
                  : 'Bắt đầu trò chuyện với AI để xem lịch sử tại đây'
                }
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        {conversations.length > 0 && (
          <div className="mt-6 text-center text-sm text-gray-500">
            Tổng cộng {conversations.length} cuộc trò chuyện
            {searchQuery && filteredConversations.length !== conversations.length && (
              <span> • Hiển thị {filteredConversations.length} kết quả</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;