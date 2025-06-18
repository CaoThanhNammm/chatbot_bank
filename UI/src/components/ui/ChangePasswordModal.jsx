import React, { useState } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { IoEyeOutline, IoEyeOffOutline, IoShieldCheckmarkOutline } from 'react-icons/io5';
import { changePassword } from '../../utils/auth';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push('Mật khẩu phải có ít nhất 8 ký tự');
    }
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Phải có ít nhất 1 chữ cái thường');
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Phải có ít nhất 1 chữ cái hoa');
    }
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Phải có ít nhất 1 số');
    }
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)');
    }
    return errors;
  };

  const handleInputChange = (field, value) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    
    // Validate current password
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }
    
    // Validate new password
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else {
      const passwordErrors = validatePassword(passwordForm.newPassword);
      if (passwordErrors.length > 0) {
        newErrors.newPassword = passwordErrors[0]; // Show first error
      }
    }
    
    // Validate confirm password
    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    
    // Check if new password is same as current
    if (passwordForm.currentPassword === passwordForm.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác mật khẩu hiện tại';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      // Call API to change password
      const response = await changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword
      });
      
      if (response.success) {
        // Reset form
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setErrors({});
        setSuccessMessage('Đổi mật khẩu thành công!');
        
        // Close modal after showing success message
        setTimeout(() => {
          setSuccessMessage('');
          onClose();
        }, 2000);
      } else {
        // Handle API error response
        setErrors({ 
          general: response.error || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại.' 
        });
      }
    } catch (error) {
      console.error('Change password error:', error);
      
      // Handle different types of errors
      if (error.message) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: 'Có lỗi xảy ra. Vui lòng thử lại sau.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPasswordForm({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setSuccessMessage('');
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    onClose();
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/(?=.*[a-z])/.test(password)) score++;
    if (/(?=.*[A-Z])/.test(password)) score++;
    if (/(?=.*\d)/.test(password)) score++;
    if (/(?=.*[@$!%*?&])/.test(password)) score++;
    
    const strengths = [
      { strength: 0, label: '', color: '' },
      { strength: 1, label: 'Rất yếu', color: 'bg-red-500' },
      { strength: 2, label: 'Yếu', color: 'bg-orange-500' },
      { strength: 3, label: 'Trung bình', color: 'bg-yellow-500' },
      { strength: 4, label: 'Mạnh', color: 'bg-green-500' },
      { strength: 5, label: 'Rất mạnh', color: 'bg-emerald-500' }
    ];
    
    return strengths[score];
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Đổi mật khẩu"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Security Notice */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start">
            <IoShieldCheckmarkOutline size={20} className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                Bảo mật tài khoản
              </h4>
              <p className="text-xs text-blue-700">
                Để bảo vệ tài khoản, vui lòng chọn mật khẩu mạnh và không chia sẻ với ai.
              </p>
            </div>
          </div>
        </div>

        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu hiện tại *
          </label>
          <div className="relative">
            <Input
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              placeholder="Nhập mật khẩu hiện tại"
              className={errors.currentPassword ? 'border-red-300' : ''}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
          {errors.currentPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.currentPassword}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu mới *
          </label>
          <div className="relative">
            <Input
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              placeholder="Nhập mật khẩu mới"
              className={errors.newPassword ? 'border-red-300' : ''}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {passwordForm.newPassword && (
            <div className="mt-2">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                    style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{passwordStrength.label}</span>
              </div>
            </div>
          )}
          
          {errors.newPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
          )}
          
          {/* Password Requirements */}
          <div className="mt-2 text-xs text-gray-600">
            <p className="mb-1">Mật khẩu phải có:</p>
            <ul className="space-y-0.5 pl-3">
              <li className={passwordForm.newPassword.length >= 8 ? 'text-green-600' : ''}>
                • Ít nhất 8 ký tự
              </li>
              <li className={/(?=.*[a-z])/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                • Ít nhất 1 chữ cái thường
              </li>
              <li className={/(?=.*[A-Z])/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                • Ít nhất 1 chữ cái hoa
              </li>
              <li className={/(?=.*\d)/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                • Ít nhất 1 số
              </li>
              <li className={/(?=.*[@$!%*?&])/.test(passwordForm.newPassword) ? 'text-green-600' : ''}>
                • Ít nhất 1 ký tự đặc biệt
              </li>
            </ul>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu mới *
          </label>
          <div className="relative">
            <Input
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              placeholder="Nhập lại mật khẩu mới"
              className={errors.confirmPassword ? 'border-red-300' : ''}
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-600">{successMessage}</p>
          </div>
        )}

        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button 
            type="submit" 
            variant="primary" 
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangePasswordModal;
