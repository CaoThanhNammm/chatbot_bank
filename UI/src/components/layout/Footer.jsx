import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">🏦</span>
              </div>
              <h3 className="text-lg font-semibold">AGRIBANK AI</h3>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Trợ lý AI ngân hàng thông minh, hỗ trợ khách hàng 24/7 với công nghệ tiên tiến.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  Giới thiệu
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Liên hệ
                </Link>
              </li>
              <li>
                <Link to="/chat" className="text-gray-400 hover:text-white transition-colors">
                  Chat AI
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-semibold mb-4">Dịch vụ</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="text-gray-400">Tư vấn tài chính</span>
              </li>
              <li>
                <span className="text-gray-400">Hỗ trợ giao dịch</span>
              </li>
              <li>
                <span className="text-gray-400">Tra cứu thông tin</span>
              </li>
              <li>
                <span className="text-gray-400">Báo cáo tài khoản</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm">
              <li className="text-gray-400">
                📧 support@AGRIBANK-ai.com
              </li>
              <li className="text-gray-400">
                📞 1800 588 888
              </li>
              <li className="text-gray-400">
                📍 123 Đường Lê Lợi, Q1, TP.HCM
              </li>
              <li className="text-gray-400">
                🕒 24/7 - Hỗ trợ không ngừng
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 AGRIBANK AI. Tất cả quyền được bảo lưu. | 
            <span className="mx-2">Chính sách bảo mật</span> | 
            <span className="mx-2">Điều khoản sử dụng</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
