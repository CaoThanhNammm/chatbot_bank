import React from 'react';
import { Link } from 'react-router-dom';
import { IoSettingsOutline, IoTimeOutline } from 'react-icons/io5';
import { FiUser, FiLogOut } from 'react-icons/fi';
import Button from '../ui/Button';
import UserProfile from '../ui/UserProfile';
import { useAuth } from '../../contexts/AuthContext';
import agribankLogo from '../../assets/icon.jpg';

const Header = ({ 
  onSettingsClick, 
  onHistoryClick, 
  isGuestMode = false, 
  rightElement = null,
  variant = 'default' // 'default' for homepage, 'chat' for chat page
}) => {
  const { authenticated, user, logout } = useAuth();

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

  // Chat page header style
  if (variant === 'chat') {
    return (
      <header className="sticky top-0 z-10 px-4 py-4 bg-white border-b border-neutral-200">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 hover:scale-105 px-2 py-1 rounded-lg">
            <img 
              src={agribankLogo} 
              alt="AGRIBANK Logo" 
              className="h-8 w-auto object-contain rounded shadow-sm"
            />
            <div>
              <h1 className="text-xl font-semibold font-playfair text-neutral-800">
                AGRIBANK
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
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-all duration-200 hover:scale-105 px-2 py-1 rounded-lg">
            <img 
              src={agribankLogo} 
              alt="AGRIBANK Logo" 
              className="h-10 w-auto object-contain rounded shadow-sm"
            />
            <div>
              <h1 className="text-xl font-display font-bold text-gray-900">
                AGRIBANK
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
