import React, { useState, useEffect } from 'react';
import { IoClose, IoPerson, IoMail, IoLockClosed, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { Button } from '../ui';
import api from '../../utils/api';

const UserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Password không hiển thị khi edit
        role: user.role || 'user'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user'
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Họ tên không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    // Chỉ validate password khi tạo user mới
    if (!user) {
      if (!formData.password.trim()) {
        newErrors.password = 'Mật khẩu không được để trống';
      } else {
        const passwordErrors = validatePassword(formData.password);
        if (passwordErrors.length > 0) {
          newErrors.password = passwordErrors[0]; // Show first error
        }
      }
    }

    return newErrors;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (user) {
        // Update existing user - không gửi password
        const updateData = {
          name: formData.name,
          email: formData.email,
          role: formData.role
        };
        const response = await api.admin.updateUser(user.id, updateData);
        
        if (response.success) {
          onSave(response.data); // Pass updated user data back to parent
          onClose();
        } else {
          setErrors({ submit: response.message || 'Có lỗi xảy ra khi cập nhật người dùng' });
        }
      } else {
        // Create new user - gửi tất cả dữ liệu bao gồm password
        const response = await api.admin.createUser(formData);
        
        if (response.success) {
          onSave(response.data); // Pass created user data back to parent
          onClose();
        } else {
          setErrors({ submit: response.message || 'Có lỗi xảy ra khi tạo người dùng' });
        }
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setErrors({ submit: 'Có lỗi xảy ra khi lưu thông tin người dùng' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setErrors({});
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <IoClose size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoPerson className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Nhập họ và tên"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoMail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 ${
                  errors.email ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Nhập email"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password - chỉ hiển thị khi tạo user mới */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IoLockClosed className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent ${
                    errors.password ? 'border-red-300' : 'border-gray-200'
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrength(formData.password).color}`}
                        style={{ width: `${(getPasswordStrength(formData.password).strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600">{getPasswordStrength(formData.password).label}</span>
                  </div>
                </div>
              )}
              
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
              
              {/* Password Requirements */}
              <div className="mt-2 text-xs text-gray-600">
                <p className="mb-1">Mật khẩu phải có:</p>
                <ul className="space-y-0.5 pl-3">
                  <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                    • Ít nhất 8 ký tự
                  </li>
                  <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-600' : ''}>
                    • Ít nhất 1 chữ cái thường
                  </li>
                  <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600' : ''}>
                    • Ít nhất 1 chữ cái hoa
                  </li>
                  <li className={/(?=.*\d)/.test(formData.password) ? 'text-green-600' : ''}>
                    • Ít nhất 1 số
                  </li>
                  <li className={/(?=.*[@$!%*?&])/.test(formData.password) ? 'text-green-600' : ''}>
                    • Ít nhất 1 ký tự đặc biệt
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vai trò *
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900"
            >
              <option value="user">Khách hàng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {user ? 'Đang cập nhật...' : 'Đang thêm...'}
                </div>
              ) : (
                user ? 'Cập nhật' : 'Thêm mới'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
