import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { IoPersonOutline, IoColorPaletteOutline, IoNotificationsOutline, IoShieldOutline, IoChatbubbleOutline, IoLogInOutline } from 'react-icons/io5';

const SettingsModal = ({ isOpen, onClose, isGuestMode = false }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    fontSize: 'medium',
    autoScroll: true,
    bankingAlerts: true,
    securityNotifications: true,
    language: 'vi',
    voiceInput: false,
    quickResponses: true
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cài đặt"
      className="max-w-lg"
    >
      <div className="space-y-6">
        {/* Profile Section */}
        <div>
          <h3 className="flex items-center mb-3 text-sm font-semibold text-neutral-700">
            <IoPersonOutline size={16} className="mr-2 text-sage-600" />
            Thông tin tài khoản
          </h3>
          {isGuestMode ? (
            <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
              <p className="mb-3 text-sm text-blue-700">
                Bạn đang sử dụng chế độ khách. Đăng nhập để lưu lịch sử trò chuyện và nhận hỗ trợ cá nhân hóa.
              </p>
              <Link to="/login">
                <Button size="sm" className="flex items-center justify-center w-full">
                  <IoLogInOutline size={16} className="mr-2" />
                  Đăng nhập ngay
                </Button>
              </Link>
            </div>
          ) : (
            <div className="p-4 border rounded-lg bg-sage-50 border-sage-200">
              <p className="text-sm text-neutral-600">
                Đã đăng nhập: <strong>Khách hàng VietBank</strong>
              </p>
            </div>
          )}
        </div>

        {/* Appearance Section */}
        <div>
          <h3 className="flex items-center mb-3 text-sm font-semibold text-neutral-700">
            <IoColorPaletteOutline size={16} className="mr-2 text-sage-600" />
            Giao diện
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-sm text-neutral-600">Chủ đề</label>
              <select 
                value={settings.theme}
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="w-full p-2 border rounded-lg border-neutral-200 focus:ring-2 focus:ring-sage-300 focus:border-transparent"
              >
                <option value="light">Sáng</option>
                <option value="dark">Tối</option>
                <option value="auto">Tự động</option>
              </select>
            </div>
            
            <div>
              <label className="block mb-1 text-sm text-neutral-600">Cỡ chữ</label>
              <select 
                value={settings.fontSize}
                onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                className="w-full p-2 border rounded-lg border-neutral-200 focus:ring-2 focus:ring-sage-300 focus:border-transparent"
              >
                <option value="small">Nhỏ</option>
                <option value="medium">Vừa</option>
                <option value="large">Lớn</option>
              </select>
            </div>
          </div>
        </div>        {/* Preferences Section */}
        <div>
          <h3 className="flex items-center mb-3 text-sm font-semibold text-neutral-700">
            <IoNotificationsOutline size={16} className="mr-2 text-sage-600" />
            Thông báo & Tùy chọn
          </h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                className="rounded border-neutral-300 text-sage-600 focus:ring-sage-300"
              />
              <span className="ml-2 text-sm text-neutral-700">Bật thông báo chung</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.bankingAlerts}
                onChange={(e) => handleSettingChange('bankingAlerts', e.target.checked)}
                className="rounded border-neutral-300 text-sage-600 focus:ring-sage-300"
              />
              <span className="ml-2 text-sm text-neutral-700">Thông báo giao dịch ngân hàng</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.securityNotifications}
                onChange={(e) => handleSettingChange('securityNotifications', e.target.checked)}
                className="rounded border-neutral-300 text-sage-600 focus:ring-sage-300"
              />
              <span className="ml-2 text-sm text-neutral-700">Cảnh báo bảo mật</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoScroll}
                onChange={(e) => handleSettingChange('autoScroll', e.target.checked)}
                className="rounded border-neutral-300 text-sage-600 focus:ring-sage-300"
              />
              <span className="ml-2 text-sm text-neutral-700">Tự động cuộn đến tin nhắn mới</span>
            </label>
          </div>
        </div>

        {/* Chat Features Section */}
        <div>
          <h3 className="flex items-center mb-3 text-sm font-semibold text-neutral-700">
            <IoChatbubbleOutline size={16} className="mr-2 text-sage-600" />
            Tính năng Chat
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-sm text-neutral-600">Ngôn ngữ giao diện</label>
              <select 
                value={settings.language}
                onChange={(e) => handleSettingChange('language', e.target.value)}
                className="w-full p-2 border rounded-lg border-neutral-200 focus:ring-2 focus:ring-sage-300 focus:border-transparent"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.voiceInput}
                onChange={(e) => handleSettingChange('voiceInput', e.target.checked)}
                className="rounded border-neutral-300 text-sage-600 focus:ring-sage-300"
              />
              <span className="ml-2 text-sm text-neutral-700">Bật nhập liệu bằng giọng nói</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.quickResponses}
                onChange={(e) => handleSettingChange('quickResponses', e.target.checked)}
                className="rounded border-neutral-300 text-sage-600 focus:ring-sage-300"
              />
              <span className="ml-2 text-sm text-neutral-700">Hiển thị gợi ý trả lời nhanh</span>
            </label>
          </div>
        </div>

        {/* Security Section */}
        <div>
          <h3 className="flex items-center mb-3 text-sm font-semibold text-neutral-700">
            <IoShieldOutline size={16} className="mr-2 text-sage-600" />
            Bảo mật
          </h3>
          <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
            <p className="mb-2 text-sm text-orange-800">
              <strong>Lưu ý bảo mật:</strong>
            </p>
            <ul className="space-y-1 text-xs text-orange-700">
              <li>• Không chia sẻ thông tin tài khoản với người khác</li>
              <li>• Luôn đăng xuất sau khi sử dụng</li>
              <li>• Liên hệ 1900 123456 nếu có hoạt động bất thường</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end pt-4 space-x-3 border-t border-neutral-100">
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" onClick={onClose}>
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
