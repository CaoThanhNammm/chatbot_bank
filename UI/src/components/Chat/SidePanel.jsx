import React, { useState, useEffect, useRef } from 'react';
import { IoTimeOutline, IoLogInOutline, IoTrashOutline, IoEllipsisVertical, IoChatbubbleOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { getGuestConversations } from '../../utils/guestChatHistory';

const SidePanel = ({ 
  isOpen, 
  onClose, 
  onSelectConversation, 
  onDeleteConversation,
  onClearHistory, 
  isGuestMode = false,
  conversations = [],
  currentConversation = null,
  loading = false
}) => {
  const [recentChats, setRecentChats] = useState([]);
  const [showDeleteMenu, setShowDeleteMenu] = useState(null);
  const [newConversationIds, setNewConversationIds] = useState(new Set());
  const deleteMenuRef = useRef(null);

  useEffect(() => {
    if (isGuestMode) {
      // Get guest conversations
      const guestHistory = getGuestConversations();
      // Show up to 10 most recent conversations
      setRecentChats(guestHistory.slice(0, 10));
    } else {
      // Use API conversations for authenticated users
      // Sort by updated_at to show most recent first
      const sortedConversations = [...conversations].sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at);
        const dateB = new Date(b.updated_at || b.created_at);
        return dateB - dateA; // Most recent first
      });
      
      // Track new conversations for animation
      const currentIds = new Set(recentChats.map(c => c.id));
      const newIds = new Set();
      sortedConversations.forEach(conv => {
        if (!currentIds.has(conv.id)) {
          newIds.add(conv.id);
        }
      });
      
      if (newIds.size > 0) {
        setNewConversationIds(newIds);
        // Remove the "new" status after animation
        setTimeout(() => {
          setNewConversationIds(new Set());
        }, 1000);
      }
      
      setRecentChats(sortedConversations);
    }
  }, [isGuestMode, conversations]); // Remove isOpen dependency to always update when conversations change

  // Handle click outside to close delete menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deleteMenuRef.current && !deleteMenuRef.current.contains(event.target)) {
        setShowDeleteMenu(null);
      }
    };

    if (showDeleteMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDeleteMenu]);

  const formatConversationTitle = (title) => {
    return title.length > 25 ? `${title.substring(0, 25)}...` : title;
  };

  const handleDeleteConversation = (e, conversationId) => {
    e.stopPropagation();
    if (onDeleteConversation) {
      onDeleteConversation(conversationId);
    }
    setShowDeleteMenu(null);
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Hôm qua';
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
          onClick={onClose}
        />
      )}      {/* Side panel */}
      <div className={`
        fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out transform bg-white shadow-2xl w-80
        ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
        flex flex-col
      `}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Lịch sử trò chuyện</h2>
          {isGuestMode && (
            <Link to="/login">
              <Button
                className="w-full"
                variant="outline"
              >
                <IoLogInOutline size={18} className="mr-2" />
                Đăng nhập
              </Button>
            </Link>
          )}
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Recent Chats - Show for all users */}
          <div>
            <h3 className="flex items-center mb-3 text-sm font-semibold text-red-800">
              <IoChatbubbleOutline size={16} className="mr-2" />
              Cuộc trò chuyện
              {loading && (
                <div className="flex items-center ml-2">
                  <div className="w-3 h-3 border border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-1 text-xs text-gray-500">Đang tạo...</span>
                </div>
              )}
            </h3>
            <div className="space-y-1">
              {recentChats.length > 0 ? (
                recentChats.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => onSelectConversation && onSelectConversation(conversation)}
                    className={`group p-3 text-sm rounded-lg cursor-pointer border relative
                      ${newConversationIds.has(conversation.id) ? 'conversation-item-new' : 'conversation-item'}
                      ${currentConversation && currentConversation.id === conversation.id 
                        ? 'bg-blue-50 border-blue-200 text-blue-800 shadow-sm' 
                        : 'text-gray-600 border-transparent hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm'
                      }`}
                    title={conversation.title}
                    style={{ position: 'relative', zIndex: showDeleteMenu === conversation.id ? 50 : 1 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center flex-1">
                        <span className="flex-1 truncate pr-2">
                          {formatConversationTitle(conversation.title)}
                        </span>
                        {newConversationIds.has(conversation.id) && (
                          <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          {conversation.updated_at ? formatDate(conversation.updated_at) : ''}
                        </span>
                        {!isGuestMode && (
                          <div className="relative" ref={showDeleteMenu === conversation.id ? deleteMenuRef : null}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDeleteMenu(showDeleteMenu === conversation.id ? null : conversation.id);
                              }}
                              className={`p-1 rounded hover:bg-gray-200 transition-opacity duration-200 ${
                                showDeleteMenu === conversation.id 
                                  ? 'opacity-100' 
                                  : 'opacity-0 group-hover:opacity-100'
                              }`}
                              style={{ 
                                pointerEvents: 'auto',
                                zIndex: showDeleteMenu === conversation.id ? 60 : 10
                              }}
                            >
                              <IoEllipsisVertical size={12} />
                            </button>
                            {showDeleteMenu === conversation.id && (
                              <div 
                                className="absolute right-0 top-6 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]"
                                style={{ zIndex: 100 }}
                              >
                                <button
                                  onClick={(e) => handleDeleteConversation(e, conversation.id)}
                                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center transition-colors duration-150"
                                  style={{ pointerEvents: 'auto' }}
                                >
                                  <IoTrashOutline size={14} className="mr-2" />
                                  Xóa
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-sm italic text-gray-500 text-center">
                  <IoChatbubbleOutline size={32} className="mx-auto mb-3 text-gray-300" />
                  {loading ? 'Đang tải...' : 'Chưa có cuộc trò chuyện nào'}
                  {!loading && !isGuestMode && (
                    <p className="text-xs mt-2">Nhấn "Cuộc trò chuyện mới" để bắt đầu</p>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Guest mode info */}
          {isGuestMode && (
            <>
              {/* Clear History Button for Guest Mode */}
              <div className="mb-6">
                <Button
                  onClick={onClearHistory}
                  className="w-full"
                  variant="outline"
                  size="sm"
                >
                  <IoTrashOutline size={16} className="mr-2" />
                  Xóa lịch sử trò chuyện
                </Button>
                <p className="mt-2 text-xs italic text-gray-500">
                  Lịch sử trò chuyện được lưu trên trình duyệt của bạn
                </p>
              </div>
              
              <div className="p-4 mt-4 text-sm text-blue-700 rounded-lg bg-blue-50">
                <h3 className="mb-2 font-medium">Chế độ khách</h3>
                <p className="mb-3">Đăng nhập để:</p>
                <ul className="pl-5 mb-3 space-y-1 list-disc">
                  <li>Đồng bộ lịch sử trên nhiều thiết bị</li>
                  <li>Nhận hỗ trợ cá nhân hóa</li>
                  <li>Truy cập thông tin tài khoản</li>
                </ul>
                <Link to="/login">
                  <Button size="sm" className="w-full">Đăng nhập ngay</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SidePanel;
