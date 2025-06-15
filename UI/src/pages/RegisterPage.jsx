import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoEye, IoEyeOff, IoMail, IoLockClosed, IoPersonOutline, IoCallOutline } from 'react-icons/io5';
import { AuthLayout, Button } from '../components';
import { USER_ROLES, register } from '../utils/auth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    return newErrors;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Try API registration
      const userData = await register({
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: USER_ROLES.USER
      });
      
      if (userData) {
        navigate('/chat');
      } else {
        // Fallback to demo registration for development
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          role: USER_ROLES.USER,
          accountNumber: Math.random().toString().slice(2, 12),
          balance: '0'
        }));
        navigate('/chat');
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Tạo tài khoản mới"
      subtitle="Đăng ký để sử dụng VietBank AI chatbot"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
            Họ và tên *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoPersonOutline className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              value={formData.fullName}
              onChange={handleInputChange}
              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent ${
                errors.fullName ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Nhập họ và tên đầy đủ"
            />
          </div>
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Nhập địa chỉ email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Số điện thoại *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoCallOutline className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent ${
                errors.phone ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Nhập số điện thoại"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoLockClosed className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={handleInputChange}
              className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent ${
                errors.password ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Tạo mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <IoEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <IoEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            Xác nhận mật khẩu *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoLockClosed className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent ${
                errors.confirmPassword ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <IoEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              ) : (
                <IoEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <input
            id="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-700">
            Tôi đồng ý với{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              Điều khoản sử dụng
            </Link>{' '}
            và{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-500">
              Chính sách bảo mật
            </Link>
          </label>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full py-3"
          disabled={isLoading}
        >
          {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </Button>

        {/* Login link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
              Đăng nhập
            </Link>
          </span>
        </div>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
