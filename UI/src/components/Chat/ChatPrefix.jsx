import React from 'react';

const ChatPrefix = ({ user }) => {
  if (!user) return null;

  return (
    <div className="px-4 py-2 bg-gradient-to-r from-sage-50 to-ocean-50 border-b border-neutral-100">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-neutral-600">
          Xin chào, <span className="font-semibold text-gray-900">{user.name || user.first_name || 'Khách hàng'}</span>! 
          {user.role === 'user' && user.balance && (
            <span className="ml-2 text-xs text-neutral-500">
              Số dư: <span className="font-medium text-sage-600">{user.balance} VNĐ</span>
            </span>
          )}
        </p>
      </div>
    </div>
  );
};

export default ChatPrefix;