import React, { useState, useRef, useEffect } from 'react';
import { IoSettingsOutline, IoTimeOutline, IoChevronDown, IoShield, IoDocument, IoPeople } from 'react-icons/io5';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';
import { getCurrentUserRole, USER_ROLES, hasPermission, PERMISSIONS } from '../../utils/auth';

const Header = ({ onSettingsClick, onHistoryClick, isGuestMode = false, rightElement = null }) => {
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

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/';
  };

  const isAdmin = currentUserRole === USER_ROLES.ADMIN;
  const isStaff = currentUserRole === USER_ROLES.STAFF;
  const hasAdminAccess = hasPermission(currentUserRole, PERMISSIONS.VIEW_ADMIN_PANEL) || 
                        hasPermission(currentUserRole, PERMISSIONS.UPLOAD_TRAINING_FILES);

  return (
    <header className="sticky top-0 z-10 px-4 py-4 bg-white border-b border-neutral-200">
      <div className="flex items-center justify-between max-w-6xl mx-auto">
        {/* Logo & Title */}
        <Link to="/chat" className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-sage-600 to-ocean-600">
            <span className="text-sm font-bold text-white">VB</span>
          </div>
          <div>
            <h1 className="text-xl font-semibold font-playfair text-neutral-800">
              VietBank AI
            </h1>
            <p className="-mt-1 text-xs text-neutral-500">
              Trợ lý AI ngân hàng
            </p>
          </div>
        </Link>        {/* Navigation & Actions */}
        <div className="flex items-center space-x-2">
          {/* Custom right element (for guest mode) */}
          {rightElement}
          
          {/* Regular authenticated user controls */}
          {!isGuestMode && (
            <>
              {/* Admin/Staff Menu */}
              {hasAdminAccess && (
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
                          <div className="my-1 border-t border-gray-100"></div>
                        </>
                      )}
                      
                      {/* Staff options */}
                      {(isStaff || isAdmin) && (
                        <Link
                          to="/staff/training"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsAdminMenuOpen(false)}
                        >
                          <IoDocument size={16} className="mr-3" />
                          Upload dữ liệu huấn luyện
                        </Link>
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onHistoryClick}
                className="p-2 rounded-full hover:bg-neutral-100"
                aria-label="Lịch sử chat"
              >
                <IoTimeOutline size={18} className="text-neutral-600" />
              </Button>
              
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
          <Button
            variant="ghost"
            size="sm"
            onClick={onSettingsClick}
            className="p-2 rounded-full hover:bg-neutral-100"
            aria-label="Cài đặt"
          >
            <IoSettingsOutline size={18} className="text-neutral-600" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
