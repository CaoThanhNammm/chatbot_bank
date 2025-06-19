import React, { useState, useEffect } from 'react';
import { IoSearch, IoAdd, IoEllipsisVertical, IoPerson, IoMail, IoCalendar, IoCheckmarkCircle, IoCloseCircle, IoLockClosed, IoEye } from 'react-icons/io5';
import { ChatHeader } from '../components';
import { Button, UserModal } from '../components';
import { mockUsers, STATUS_COLORS } from '../data/adminData';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  // This component is already protected by AdminRoute, so no need for additional permission check

  // Load users from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        const response = await api.admin.getUsers();
        
        if (response.success) {
          // Handle different response formats
          const usersData = Array.isArray(response.data) ? response.data : 
                           (response.data && Array.isArray(response.data.data)) ? response.data.data :
                           [];
          setUsers(usersData);
        } else {
          // Fallback to mock data for development
          console.warn('API failed, using mock data:', response.error);
          setUsers(mockUsers);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        setError('Failed to load users');
        // Fallback to mock data
        setUsers(mockUsers);
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Filter users based on search and filters
  useEffect(() => {
    if (!Array.isArray(users)) {
      setFilteredUsers([]);
      return;
    }

    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.first_name && user.first_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.last_name && user.last_name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, selectedRole, selectedStatus]);  const handleStatusToggle = async (userId) => {
    try {
      const user = users.find(u => u.id === userId);
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      const newIsActive = newStatus === 'active' ? 1 : -1; // Cập nhật isActive = -1 khi khóa
      
      let response;
      if (newStatus === 'active') {
        response = await api.admin.activateUser(userId);
      } else {
        response = await api.admin.deactivateUser(userId);
      }
      
      if (response.success) {
        setUsers(prev => prev.map(user =>
          user.id === userId
            ? { ...user, status: newStatus, isActive: newIsActive }
            : user
        ));
        setSuccessMessage('Cập nhật trạng thái người dùng thành công!');
      } else {
        setError(response.error || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Đã xảy ra lỗi khi cập nhật trạng thái');
    }
    
    setTimeout(() => {
      setSuccessMessage('');
      setError('');
    }, 3000);
  };



  const handleSaveUser = (userData) => {
    if (editingUser) {
      // Update existing user with data from API
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? userData : user
      ));
      setSuccessMessage('Cập nhật thông tin người dùng thành công!');
    } else {
      // Add new user (for future implementation)
      setUsers(prev => [userData, ...prev]);
      setSuccessMessage('Thêm người dùng mới thành công!');
    }
    setTimeout(() => setSuccessMessage(''), 3000);
    setEditingUser(null);
  };

  const formatDate = (date) => {
    if (!date) return 'Chưa có';
    
    // Handle both Date objects and ISO strings
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isNaN(dateObj.getTime())) return 'Không hợp lệ';
    
    const now = new Date();
    const diffTime = Math.abs(now - dateObj);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Nếu trong vòng 7 ngày, hiển thị tương đối
    if (diffDays <= 7) {
      if (diffDays === 0) return 'Hôm nay';
      if (diffDays === 1) return 'Hôm qua';
      return `${diffDays} ngày trước`;
    }
    
    // Nếu cùng năm, bỏ năm
    if (dateObj.getFullYear() === now.getFullYear()) {
      return dateObj.toLocaleDateString('vi-VN', {
        month: '2-digit',
        day: '2-digit'
      });
    }
    
    // Hiển thị đầy đủ nhưng ngắn gọn
    return dateObj.toLocaleDateString('vi-VN', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const color = STATUS_COLORS[status] || 'gray';
    const text = status === 'active' ? 'Hoạt động' : 'Không hoạt động';
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
        color === 'green' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleMap = {
      admin: { text: 'Quản trị viên', color: 'bg-red-100 text-red-800' },
      user: { text: 'Khách hàng', color: 'bg-gray-100 text-gray-800' }
    };

    const roleInfo = roleMap[role] || roleMap.user;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleInfo.color}`}>
        {roleInfo.text}
      </span>
    );
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <ChatHeader />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600">
            Quản lý tài khoản và quyền hạn của người dùng trong hệ thống
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <IoCloseCircle className="text-red-500 mr-2" size={20} />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <IoCheckmarkCircle className="text-green-500 mr-2" size={20} />
              <span className="text-green-800">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <IoSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="user">Khách hàng</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center space-x-2"
                >
                  <IoAdd size={20} />
                  <span>Thêm người dùng</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải danh sách người dùng...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/6">
                      Người dùng
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Vai trò
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Trạng thái
                    </th>
                    <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Đăng nhập cuối
                    </th>
                    <th className="px-2 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <IoPerson size={14} className="text-gray-500" />
                        </div>
                        <div className="ml-2 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.name || user.username}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center truncate">
                            <IoMail size={10} className="mr-1 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <IoCalendar size={10} className="mr-1 flex-shrink-0" />
                        <span className="truncate text-xs" title={user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa có'}>
                          {formatDate(user.lastLogin)}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-1">
                        {/* Button khóa/kích hoạt tài khoản */}
                        <div className="relative group">
                          <button
                            onClick={() => handleStatusToggle(user.id)}
                            className={`p-1.5 rounded-full transition-all duration-200 hover:scale-105 ${
                              user.status === 'active'
                                ? 'text-red-600 hover:bg-red-100 bg-red-50'
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {user.status === 'active' ? (
                              <IoLockClosed size={16} />
                            ) : (
                              <IoCheckmarkCircle size={16} />
                            )}
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                            {user.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                          </div>
                        </div>
                        
                        {/* Button xem chi tiết */}
                        <div className="relative group">
                          <button
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 hover:scale-105"
                          >
                            <IoEye size={16} />
                          </button>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                            Xem chi tiết
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                  <IoPerson size={48} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">
                    Không tìm thấy người dùng
                  </h3>
                  <p className="text-gray-400">
                    Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {Array.isArray(users) ? users.length : 0}
            </div>
            <div className="text-sm text-gray-600">Tổng người dùng</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {Array.isArray(users) ? users.filter(u => u.status === 'active').length : 0}
            </div>
            <div className="text-sm text-gray-600">Đang hoạt động</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {Array.isArray(users) ? users.filter(u => u.role === 'user').length : 0}
            </div>
            <div className="text-sm text-gray-600">Khách hàng</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {Array.isArray(users) ? users.filter(u => u.role === 'admin').length : 0}
            </div>
            <div className="text-sm text-gray-600">Quản trị viên</div>          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isCreateModalOpen || editingUser !== null}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingUser(null);
        }}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </div>
  );
};

export default AdminUsersPage;
