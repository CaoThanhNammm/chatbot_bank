import React, { useState, useEffect } from 'react';
import { IoSearch, IoAdd, IoEllipsisVertical, IoPerson, IoMail, IoCalendar, IoCheckmarkCircle, IoCloseCircle } from 'react-icons/io5';
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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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
          setUsers(response.data);
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
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchQuery.toLowerCase())
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
      
      let response;
      if (newStatus === 'active') {
        response = await api.admin.activateUser(userId);
      } else {
        response = await api.admin.deactivateUser(userId);
      }
      
      if (response.success) {
        setUsers(prev => prev.map(user =>
          user.id === userId
            ? { ...user, status: newStatus }
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

  const handleDeleteUser = (userId) => {
    setDeleteConfirm(userId);
  };

  const confirmDelete = async () => {
    if (deleteConfirm) {
      try {
        const response = await api.admin.deleteUser(deleteConfirm);
        
        if (response.success) {
          setUsers(prev => prev.filter(user => user.id !== deleteConfirm));
          setSuccessMessage('Xóa người dùng thành công!');
        } else {
          setError(response.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setError('Đã xảy ra lỗi khi xóa người dùng');
      }
      
      setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 3000);
      setDeleteConfirm(null);
    }
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? userData : user
      ));
      setSuccessMessage('Cập nhật thông tin người dùng thành công!');
    } else {
      // Add new user
      setUsers(prev => [userData, ...prev]);
      setSuccessMessage('Thêm người dùng mới thành công!');
    }
    setTimeout(() => setSuccessMessage(''), 3000);
    setEditingUser(null);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN');
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
      staff: { text: 'Nhân viên', color: 'bg-blue-100 text-blue-800' },
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="staff">Nhân viên</option>
                  <option value="user">Khách hàng</option>
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phòng ban
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đăng nhập cuối
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <IoPerson size={20} className="text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <IoMail size={14} className="mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.department || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <IoCalendar size={14} className="mr-1" />
                        {formatDate(user.lastLogin)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleStatusToggle(user.id)}
                          className={`p-2 rounded-full ${
                            user.status === 'active'
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={user.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {user.status === 'active' ? (
                            <IoCloseCircle size={18} />
                          ) : (
                            <IoCheckmarkCircle size={18} />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Xóa người dùng"
                        >
                          <IoCloseCircle size={18} />
                        </button>
                        <button
                          onClick={() => setEditingUser(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Chỉnh sửa"
                        >
                          <IoEllipsisVertical size={18} />
                        </button>
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
              {users.length}
            </div>
            <div className="text-sm text-gray-600">Tổng người dùng</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Đang hoạt động</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'staff').length}
            </div>
            <div className="text-sm text-gray-600">Nhân viên</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Quản trị viên</div>          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg">
            {successMessage}
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Xác nhận xóa người dùng
              </h3>
              <p className="text-gray-500 mb-4">
                Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1"
                  variant="outline"
                >
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    handleDeleteUser(deleteConfirm);
                    setDeleteConfirm(null);
                    setSuccessMessage('Đã xóa người dùng thành công');
                  }}
                  className="flex-1"
                >
                  Xóa người dùng
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa người dùng
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="outline"
              >
                Hủy
              </Button>
              <Button
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Xóa
              </Button>
            </div>
          </div>
        </div>
      )}

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
