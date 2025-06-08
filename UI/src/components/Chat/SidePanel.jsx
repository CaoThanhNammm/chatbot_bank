import React, { useState, useEffect } from 'react';
import { IoAdd, IoTimeOutline, IoBookmarkOutline } from 'react-icons/io5';
import Button from '../ui/Button';
import { samplePrompts } from '../../data/mockData';
import { getChatHistory } from '../../utils/chatHistory';

const SidePanel = ({ isOpen, onClose, onPromptSelect, onNewChat, onSelectConversation }) => {
  const [recentChats, setRecentChats] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const history = getChatHistory();
      // Show only the 3 most recent conversations
      setRecentChats(history.slice(0, 3));
    }
  }, [isOpen]);

  const formatConversationTitle = (title) => {
    return title.length > 25 ? `${title.substring(0, 25)}...` : title;
  };
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Side panel */}
      <div className="
        fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300
        lg:relative lg:shadow-none lg:border-r lg:border-gray-100
      ">
        <div className="p-4 border-b border-gray-100">
          <Button
            onClick={onNewChat}
            className="w-full mb-4"
            variant="primary"
          >
            <IoAdd size={18} className="mr-2" />
            New Chat
          </Button>
        </div>
        
        <div className="p-4">
          {/* Sample Prompts */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <IoBookmarkOutline size={16} className="mr-2" />
              Quick Prompts
            </h3>
            <div className="space-y-2">
              {samplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => onPromptSelect(prompt)}
                  className="
                    w-full text-left p-3 text-sm text-gray-700 
                    hover:bg-gray-50 rounded-lg transition-colors duration-200
                    border border-transparent hover:border-gray-200
                  "
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
            {/* Recent Chats */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <IoTimeOutline size={16} className="mr-2" />
              Recent Chats
            </h3>
            <div className="space-y-1">
              {recentChats.length > 0 ? (
                recentChats.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => onSelectConversation && onSelectConversation(conversation)}
                    className="p-3 text-sm text-gray-600 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                    title={conversation.title}
                  >
                    {formatConversationTitle(conversation.title)}
                  </div>
                ))
              ) : (
                <div className="p-3 text-sm text-gray-500 italic">
                  Chưa có cuộc trò chuyện nào
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SidePanel;
