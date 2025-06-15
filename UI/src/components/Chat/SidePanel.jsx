import React, { useState, useEffect } from 'react';
import { IoAdd, IoTimeOutline, IoBookmarkOutline, IoLogInOutline, IoTrashOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { samplePrompts } from '../../data/mockData';
import { getChatHistory } from '../../utils/chatHistory';
import { getGuestConversations } from '../../utils/guestChatHistory';

const SidePanel = ({ isOpen, onClose, onPromptSelect, onNewChat, onSelectConversation, onClearHistory, isGuestMode = false }) => {
  const [recentChats, setRecentChats] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (isGuestMode) {
        // Get guest conversations
        const guestHistory = getGuestConversations();
        // Show only the 3 most recent conversations
        setRecentChats(guestHistory.slice(0, 3));
      } else {
        // Get logged-in user conversations
        const history = getChatHistory();
        // Show only the 3 most recent conversations
        setRecentChats(history.slice(0, 3));
      }
    }
  }, [isOpen, isGuestMode]);

  const formatConversationTitle = (title) => {
    return title.length > 25 ? `${title.substring(0, 25)}...` : title;
  };
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
        onClick={onClose}
      />
      
      {/* Side panel */}
      <div className="fixed top-0 left-0 z-50 h-full transition-transform duration-300 transform bg-white shadow-xl w-80 lg:relative lg:shadow-none lg:border-r lg:border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <Button
            onClick={onNewChat}
            className="w-full mb-4"
            variant="primary"
          >
            <IoAdd size={18} className="mr-2" />
            Cuộc trò chuyện mới
          </Button>
          
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
        
        <div className="p-4">
          {/* Sample Prompts */}
          <div className="mb-6">
            <h3 className="flex items-center mb-3 text-sm font-semibold text-gray-700">
              <IoBookmarkOutline size={16} className="mr-2" />
              Câu hỏi gợi ý
            </h3>
            <div className="space-y-2">
              {samplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onPromptSelect(prompt)}
                  className="w-full p-3 text-sm text-left text-gray-700 transition-colors duration-200 border border-transparent rounded-lg hover:bg-gray-50 hover:border-gray-200"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
          
          {/* Recent Chats - Show for all users */}
          <div>
            <h3 className="flex items-center mb-3 text-sm font-semibold text-gray-700">
              <IoTimeOutline size={16} className="mr-2" />
              Trò chuyện gần đây
            </h3>
            <div className="space-y-1">
              {recentChats.length > 0 ? (
                recentChats.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => onSelectConversation && onSelectConversation(conversation)}
                    className="p-3 text-sm text-gray-600 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                    title={conversation.title}
                  >
                    {formatConversationTitle(conversation.title)}
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm italic text-gray-500">
                  Chưa có cuộc trò chuyện nào
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
