import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { IoSettingsOutline, IoTimeOutline, IoChevronDown, IoShield, IoDocument, IoPeople } from 'react-icons/io5';
import { FiUser, FiLogOut } from 'react-icons/fi';
import Button from '../ui/Button';
import UserProfile from '../ui/UserProfile';
import { useAuth } from '../../contexts/AuthContext';
import { getCurrentUserRole, USER_ROLES, hasPermission, PERMISSIONS } from '../../utils/auth';

const Header = ({ 
  onSettingsClick, 
  onHistoryClick, 
  isGuestMode = false, 
  rightElement = null,
  variant = 'default' // 'default' for homepage, 'chat' for chat page
}) => {
  const { authenticated, user, logout } = useAuth();
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef(null);
  const currentUserRole = isGuestMode ? 'guest' : getCurrentUserRole();

  // Close admin menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setIsAdminMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: still redirect even if logout fails
      window.location.href = '/';
    }
  };

  const isAdmin = authenticated && user && user.is_admin;
  const isStaff = currentUserRole === USER_ROLES.STAFF;
  const hasAdminAccess = hasPermission(currentUserRole, PERMISSIONS.VIEW_ADMIN_PANEL) || 
                        hasPermission(currentUserRole, PERMISSIONS.UPLOAD_TRAINING_FILES);

  // Chat page header style
  if (variant === 'chat') {
    return (
      <header className="sticky top-0 z-10 px-4 py-4 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-sage-600 to-ocean-600">
              <span className="text-sm font-bold text-white">VB</span>
            </div>
            <div>
              <h1 className="text-xl font-semibold font-playfair text-neutral-800">
                AGRIBANK AI
              </h1>
              <p className="-mt-1 text-xs text-neutral-500">
                Trợ lý AI ngân hàng
              </p>
            </div>
          </Link>
          
          {/* Navigation & Actions */}
          <div className="flex items-center space-x-2">
            {/* Custom right element (for guest mode) */}
            {rightElement}
            
            {/* Regular authenticated user controls */}
            {!isGuestMode && (
              <>
                {/* Admin/Staff Menu */}
                {(hasAdminAccess || isAdmin) && (
                  <div className="relative" ref={adminMenuRef}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                      className="flex items-center p-2 space-x-1 rounded-full hover:bg-neutral-100"
                      aria-label="Menu quản trị"
                    >
                      <IoShield size={18} className="text-neutral-600" />
                      <IoChevronDown size={14} className="text-neutral-600" />
                    </Button>
                    
                    {isAdminMenuOpen && (
                      <div className="absolute right-0 z-20 w-56 py-1 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                        {/* Admin options */}
                        {isAdmin && (
                          <>
                            <Link
                              to="/admin/users"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsAdminMenuOpen(false)}
                            >
                              <IoPeople size={16} className="mr-3" />
                              Quản lý người dùng
                            </Link>
                            <Link
                              to="/admin/fine-tuning"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsAdminMenuOpen(false)}
                            >
                              <IoSettingsOutline size={16} className="mr-3" />
                              Quản lý Fine-tuning
                            </Link>
                            <Link
                              to="/admin/training"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsAdminMenuOpen(false)}
                            >
                              <IoDocument size={16} className="mr-3" />
                              Huấn luyện mô hình
                            </Link>
                            <div className="my-1 border-t border-gray-100"></div>
                          </>
                        )}
                        
                        {/* Staff options */}
                        {isStaff && !isAdmin && (
                          <>
                            <Link
                              to="/admin/training"
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsAdminMenuOpen(false)}
                            >
                              <IoDocument size={16} className="mr-3" />
                              Huấn luyện mô hình
                            </Link>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                
                {/* Profile Link */}
                <Link to="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-2 rounded-full hover:bg-neutral-100"
                    aria-label="Hồ sơ"
                  >
                    <FiUser size={18} className="text-neutral-600" />
                  </Button>
                </Link>
                
                {/* Chat History Button */}
                {onHistoryClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onHistoryClick}
                    className="p-2 rounded-full hover:bg-neutral-100"
                    aria-label="Lịch sử chat"
                  >
                    <IoTimeOutline size={18} className="text-neutral-600" />
                  </Button>
                )}
                
                {/* Logout Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="p-2 rounded-full hover:bg-neutral-100"
                  aria-label="Đăng xuất"
                >
                  <FiLogOut size={18} className="text-neutral-600" />
                </Button>
              </>
            )}
            
            {/* Settings Button - Available for both guest and authenticated users */}
            {onSettingsClick && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettingsClick}
                className="p-2 rounded-full hover:bg-neutral-100"
                aria-label="Cài đặt"
              >
                <IoSettingsOutline size={18} className="text-neutral-600" />
              </Button>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Default homepage header style
  return (
    <header className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">🏦</span>
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-gray-900">
                AGRIBANK AI
              </h1>
              <p className="text-xs text-gray-500">Chatbot Ngân hàng</p>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors">
              Trang chủ
            </Link>
            <Link to="/about" className="text-gray-600 hover:text-blue-600 transition-colors">
              Giới thiệu
            </Link>
            <Link to="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
              Liên hệ
            </Link>
            <Link to="/chat" className="text-gray-600 hover:text-blue-600 transition-colors">
              Chat AI
            </Link>
            
            {/* Admin Navigation with Dropdown */}
            {authenticated && user && user.is_admin && (
              <div className="relative" ref={adminMenuRef}>
                <button
                  onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
                  className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <span>Quản trị</span>
                  <IoChevronDown size={14} />
                </button>
                
                {isAdminMenuOpen && (
                  <div className="absolute top-full left-0 z-20 w-56 py-1 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                    <Link
                      to="/admin/users"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      <IoPeople size={16} className="mr-3" />
                      Quản lý User
                    </Link>
                    <Link
                      to="/admin/fine-tuning"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      <IoSettingsOutline size={16} className="mr-3" />
                      Fine-tuning
                    </Link>
                    <Link
                      to="/admin/training"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsAdminMenuOpen(false)}
                    >
                      <IoDocument size={16} className="mr-3" />
                      Huấn luyện mô hình
                    </Link>
                  </div>
                )}
              </div>
            )}
          </nav>
          
          {/* Auth buttons or User Profile */}
          <div className="flex items-center space-x-4">
            {authenticated ? (
              <UserProfile />
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Đăng nhập
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Đăng ký
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
