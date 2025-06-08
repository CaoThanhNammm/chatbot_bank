import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const Header = () => {
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
                VietBank AI
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
          
          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
