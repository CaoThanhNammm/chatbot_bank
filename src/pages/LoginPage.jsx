import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { IoEye, IoEyeOff, IoMail, IoLockClosed } from 'react-icons/io5';
import { AuthLayout, Button, Input } from '../components';
import { login, loginDemo, DEMO_ACCOUNTS } from '../utils/auth';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState({});

  // Handle success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.email) {
        setFormData(prev => ({ ...prev, usernameOrEmail: location.state.email }));
      }
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error and success message when user starts typing
    if (loginError) {
      setLoginError('');
    }
    if (successMessage) {
      setSuccessMessage('');
    }
    // Clear field-specific errors
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };  const validateForm = () => {
    const newErrors = {};

    if (!formData.usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = 'Tên đăng nhập hoặc email không được để trống';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
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
    setLoginError('');
    setErrors({});
    
    try {
      // Try API login first
      const userData = await login(formData.usernameOrEmail, formData.password, formData.rememberMe);
      
      if (userData) {
        await authLogin(userData);
        navigate('/');
      } else {
        // Fallback to demo login for development
        const demoUser = loginDemo(formData.usernameOrEmail, formData.password);
        if (demoUser) {
          await authLogin(demoUser);
          navigate('/');
        } else {
          setLoginError('Tên đăng nhập/Email hoặc mật khẩu không chính xác!');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Chào mừng trở lại"
      subtitle="Đăng nhập vào tài khoản VietBank AI của bạn"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username or Email */}
        <div>
          <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Tên đăng nhập hoặc Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="usernameOrEmail"
              name="usernameOrEmail"
              type="text"
              required
              value={formData.usernameOrEmail}
              onChange={handleInputChange}
              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent ${
                errors.usernameOrEmail ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Nhập tên đăng nhập hoặc email"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Mật khẩu
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
              className="pl-10 pr-10 w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
              placeholder="Nhập mật khẩu"
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
        </div>

        {/* Remember me & Forgot password */}
        <div className="flex items-center justify-between">
          <label className="flex items-center">
            <input
              name="rememberMe"
              type="checkbox"
              checked={formData.rememberMe}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {loginError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{loginError}</p>
          </div>
        )}

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full py-3"
          disabled={isLoading}
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>

        {/* Register link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
              Đăng ký ngay
            </Link>
          </span>
        </div>

        {/* Demo credentials */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700 font-medium mb-3">Tài khoản demo:</p>
          
          {/* Admin Account */}
          <div className="mb-3 p-3 bg-white rounded border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded">ADMIN</span>
              <button
                type="button"
                onClick={() => setFormData({usernameOrEmail: DEMO_ACCOUNTS.admin.email, password: DEMO_ACCOUNTS.admin.password})}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Sử dụng
              </button>
            </div>
            <p className="text-xs text-gray-600">Email: {DEMO_ACCOUNTS.admin.email}</p>
            <p className="text-xs text-gray-600">Password: {DEMO_ACCOUNTS.admin.password}</p>
            <p className="text-xs text-gray-500 mt-1">Quản lý người dùng & Fine-tuning</p>
          </div>

          {/* Staff Account */}
          <div className="mb-3 p-3 bg-white rounded border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">STAFF</span>
              <button
                type="button"
                onClick={() => setFormData({usernameOrEmail: DEMO_ACCOUNTS.staff.email, password: DEMO_ACCOUNTS.staff.password})}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Sử dụng
              </button>
            </div>
            <p className="text-xs text-gray-600">Email: {DEMO_ACCOUNTS.staff.email}</p>
            <p className="text-xs text-gray-600">Password: {DEMO_ACCOUNTS.staff.password}</p>
            <p className="text-xs text-gray-500 mt-1">Upload dữ liệu huấn luyện</p>
          </div>

          {/* User Account */}
          <div className="p-3 bg-white rounded border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">USER</span>
              <button
                type="button"
                onClick={() => setFormData({usernameOrEmail: DEMO_ACCOUNTS.user.email, password: DEMO_ACCOUNTS.user.password})}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Sử dụng
              </button>
            </div>
            <p className="text-xs text-gray-600">Email: {DEMO_ACCOUNTS.user.email}</p>
            <p className="text-xs text-gray-600">Password: {DEMO_ACCOUNTS.user.password}</p>
            <p className="text-xs text-gray-500 mt-1">Khách hàng thông thường</p>
          </div>
        </div>
      </form>
    </AuthLayout>
  );
};

export default LoginPage;
