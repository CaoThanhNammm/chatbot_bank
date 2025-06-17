import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiLogOut, FiSettings, FiUsers, FiCpu } from 'react-icons/fi';
import { IoChevronDown } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user: userData, logout } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getDisplayName = () => {
    if (!userData) return 'User';
    
    // If we have first_name and last_name from API
    if (userData.first_name && userData.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    
    // If we have only first_name or last_name
    if (userData.first_name) {
      return userData.first_name;
    }
    if (userData.last_name) {
      return userData.last_name;
    }
    
    // If we have name field (from demo accounts)
    if (userData.name) {
      return userData.name;
    }
    
    // Fallback to username or email
    return userData.username || userData.email || 'User';
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
      >
        {/* Avatar */}
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {getInitials(getDisplayName())}
          </span>
        </div>
        
        {/* User Info */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-medium text-gray-900 max-w-32 truncate">
            {getDisplayName()}
          </p>
          <p className="text-xs text-gray-500">
            {userData.is_admin ? 'Quản trị viên' : 'Khách hàng'}
          </p>
        </div>
        
        {/* Dropdown Arrow */}
        <IoChevronDown 
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isDropdownOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
            <p className="text-xs text-gray-500">{userData.email}</p>
          </div>
          
          <div className="py-1">
            <Link
              to="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsDropdownOpen(false)}
            >
              <FiUser className="w-4 h-4 mr-3" />
              Hồ sơ cá nhân
            </Link>
            
            <Link
              to="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsDropdownOpen(false)}
            >
              <FiSettings className="w-4 h-4 mr-3" />
              Cài đặt
            </Link>
            
            {/* Admin Menu */}
            {userData.is_admin && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quản trị
                  </p>
                </div>
                <Link
                  to="/admin/users"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiUsers className="w-4 h-4 mr-3" />
                  Quản lý người dùng
                </Link>
                <Link
                  to="/admin/fine-tuning"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FiCpu className="w-4 h-4 mr-3" />
                  Fine-tuning Model
                </Link>
              </>
            )}
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <FiLogOut className="w-4 h-4 mr-3" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;