import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, ChatHeader, SettingsModal, ChangePasswordModal } from '../components';
import { getCurrentUser, updateProfile } from '../utils/auth';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load user profile on component mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        
        // Try to get user data from API first
        const userData = await getCurrentUser();
        
        if (userData) {
          // Normalize user data structure
          const normalizedUser = {
            id: userData.id,
            fullName: userData.fullName || userData.name || userData.first_name + ' ' + userData.last_name || 'Người dùng',
            name: userData.name || userData.fullName,
            email: userData.email || '',
            phone: userData.phone || '',
            address: userData.address || '',
            accountNumber: userData.accountNumber || userData.account_number || '',
            accountType: userData.accountType || userData.account_type || 'Tài khoản cá nhân',
            balance: userData.balance || '0',
            joinDate: userData.joinDate || userData.created_at || new Date().toLocaleDateString('vi-VN'),
            role: userData.role || 'user',
            department: userData.department || null
          };
          
          setUser(normalizedUser);
          setEditForm(normalizedUser);
        } else {
          // Fallback to demo data if no user data available
          const fallbackUser = {
            id: 'demo',
            fullName: 'Nguyễn Văn An',
            name: 'Nguyễn Văn An',
            email: 'nguyen.van.an@email.com',
            phone: '0901 234 567',
            address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
            accountNumber: '0123456789',
            accountType: 'Tài khoản tiết kiệm',
            balance: '125,750,000',
            joinDate: '15/03/2020',
            role: 'user',
            department: null
          };
          setUser(fallbackUser);
          setEditForm(fallbackUser);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.');
        
        // Still show fallback data even on error
        const fallbackUser = {
          id: 'demo',
          fullName: 'Nguyễn Văn An',
          name: 'Nguyễn Văn An',
          email: 'nguyen.van.an@email.com',
          phone: '0901 234 567',
          address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
          accountNumber: '0123456789',
          accountType: 'Tài khoản tiết kiệm',
          balance: '125,750,000',
          joinDate: '15/03/2020',
          role: 'user',
          department: null
        };
        setUser(fallbackUser);
        setEditForm(fallbackUser);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(user);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccessMessage('');
      
      // Validate required fields
      if (!editForm.fullName && !editForm.name) {
        setError('Vui lòng nhập họ và tên');
        return;
      }
      
      if (!editForm.email) {
        setError('Vui lòng nhập địa chỉ email');
        return;
      }
      
      // Try to update profile via API
      const updatedUser = await updateProfile(editForm);
      
      if (updatedUser) {
        // API update successful
        const normalizedUser = {
          ...editForm,
          fullName: editForm.fullName || editForm.name,
          name: editForm.name || editForm.fullName
        };
        setUser(normalizedUser);
        setIsEditing(false);
        setSuccessMessage('Cập nhật hồ sơ thành công!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        // Fallback for demo mode - still save locally
        const normalizedUser = {
          ...editForm,
          fullName: editForm.fullName || editForm.name,
          name: editForm.name || editForm.fullName
        };
        setUser(normalizedUser);
        setIsEditing(false);
        setSuccessMessage('Cập nhật hồ sơ thành công! (Chế độ demo)');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Đã xảy ra lỗi khi cập nhật hồ sơ. Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditForm(user);
    setIsEditing(false);
    setError('');
  };

  const handleInputChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Đang tải thông tin hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-primary-600 mb-4">Không thể tải thông tin hồ sơ</p>
          <Link to="/chat" className="text-primary-600 hover:underline">
            Quay lại trang chính
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header - Same as ChatPage */}
      <ChatHeader onSettingsClick={() => setIsSettingsOpen(true)} />

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <span className="text-primary-800">{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-sage-50 border border-sage-200 rounded-lg">
            <span className="text-sage-800">{successMessage}</span>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mb-6">
          <div className="px-6 py-8 text-center">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-semibold text-primary-700">
                {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
              </span>
            </div>
            <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
              {user.fullName || user.name || 'Người dùng'}
            </h1>
            <p className="text-neutral-600">Khách hàng AGRIBANK</p>
            <p className="text-sm text-neutral-500 mt-1">Thành viên từ {user.joinDate || 'N/A'}</p>                
            {/* Edit Button */}
            <div className="mt-4">
              {!isEditing ? (
                <Button variant="outline" onClick={handleEdit}>
                  Chỉnh sửa thông tin
                </Button>
              ) : (
                <div className="flex justify-center space-x-3">
                  <Button 
                    variant="primary" 
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">
                Thông tin cá nhân
              </h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Họ và tên
                </label>
                {isEditing ? (
                  <Input
                    value={editForm.fullName || editForm.name || ''}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <p className="text-neutral-900">{user.fullName || user.name || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Email
                </label>
                {isEditing ? (
                  <Input
                    type="email"
                    value={editForm.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Nhập địa chỉ email"
                  />
                ) : (
                  <p className="text-neutral-900">{user.email || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Số điện thoại
                </label>
                {isEditing ? (
                  <Input
                    value={editForm.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <p className="text-neutral-900">{user.phone || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Địa chỉ
                </label>
                {isEditing ? (
                  <Input
                    value={editForm.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Nhập địa chỉ"
                  />
                ) : (
                  <p className="text-neutral-900">{user.address || 'Chưa cập nhật'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="px-6 py-4 border-b border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900">
                Thông tin tài khoản
              </h3>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Số tài khoản
                </label>
                <p className="text-neutral-900 font-mono text-sm">{user.accountNumber || 'Chưa cập nhật'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Loại tài khoản
                </label>
                <p className="text-neutral-900">{user.accountType || 'Tài khoản cá nhân'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Số dư khả dụng
                </label>
                <p className="text-sage-600 font-semibold text-lg">
                  {user.balance || '0'} VNĐ
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Ngày mở tài khoản
                </label>
                <p className="text-neutral-900">{user.joinDate || user.created_at || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 mt-6">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">
              Thao tác nhanh
            </h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsChangePasswordOpen(true)}
              >
                Đổi mật khẩu
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
