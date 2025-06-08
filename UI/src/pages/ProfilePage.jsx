import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, ChatHeader, SettingsModal, ChangePasswordModal } from '../components';

const ProfilePage = () => {
  const [user, setUser] = useState({
    fullName: 'Nguyễn Văn An',
    email: 'nguyen.van.an@email.com',
    phone: '0901 234 567',
    address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
    accountNumber: '0123456789',
    accountType: 'Tài khoản tiết kiệm',
    balance: '125,750,000',
    joinDate: '15/03/2020'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(user);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(user);
  };

  const handleSave = () => {
    setUser(editForm);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">      {/* Header - Same as ChatPage */}
      <ChatHeader onSettingsClick={() => setIsSettingsOpen(true)} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-8 text-center">
            <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-semibold text-sage-700">
                {user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              {user.fullName}
            </h1>
            <p className="text-gray-600">Khách hàng VietBank</p>
            <p className="text-sm text-gray-500 mt-1">Thành viên từ {user.joinDate}</p>
            
            {/* Edit Button */}
            <div className="mt-4">
              {!isEditing ? (
                <Button variant="outline" onClick={handleEdit}>
                  Chỉnh sửa thông tin
                </Button>
              ) : (
                <div className="flex justify-center space-x-3">
                  <Button variant="primary" onClick={handleSave}>
                    Lưu thay đổi
                  </Button>
                  <Button variant="secondary" onClick={handleCancel}>
                    Hủy
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Thông tin cá nhân
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                {isEditing ? (
                  <Input
                    value={editForm.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <p className="text-gray-900">{user.fullName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Nhập địa chỉ email"
                  />
                ) : (
                  <p className="text-gray-900">{user.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <Input
                    value={editForm.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <p className="text-gray-900">{user.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Địa chỉ
                </label>
                {isEditing ? (
                  <Input
                    value={editForm.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Nhập địa chỉ"
                  />
                ) : (
                  <p className="text-gray-900">{user.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Thông tin tài khoản
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số tài khoản
                </label>
                <p className="text-gray-900 font-mono text-sm">{user.accountNumber}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại tài khoản
                </label>
                <p className="text-gray-900">{user.accountType}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số dư khả dụng
                </label>
                <p className="text-sage-600 font-semibold text-lg">
                  {user.balance} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày mở tài khoản
                </label>
                <p className="text-gray-900">{user.joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Thao tác nhanh
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Đổi mật khẩu
              </Button>
              
              <Button
                variant="outline"
                className="w-full"
                onClick={() => alert('Tính năng đang phát triển')}
              >
                Lịch sử giao dịch
              </Button>
              
              <Link to="/chat" className="w-full">
                <Button variant="primary" className="w-full">
                  Chat với AI
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
        {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
};

export default ProfilePage;
