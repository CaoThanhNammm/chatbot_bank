import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoEye, IoEyeOff, IoMail, IoLockClosed, IoPersonOutline } from 'react-icons/io5';
import { AuthLayout, Button } from '../components';
import { USER_ROLES, register } from '../utils/auth';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

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

  const handlePasswordFocus = () => {
    setShowPasswordRequirements(true);
  };

  const handlePasswordBlur = () => {
    // Keep showing requirements if password is not empty
    if (!formData.password) {
      setShowPasswordRequirements(false);
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

    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    }

    // Họ tên không bắt buộc - bỏ validation

    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else {
      const passwordErrors = validatePassword(formData.password);
      if (passwordErrors.length > 0) {
        newErrors.password = passwordErrors[0]; // Show first error
      }
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
      // Try API registration with correct format
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName || '',
        last_name: formData.lastName || ''
      };

      console.log('Sending registration data:', registrationData); // Debug log
      const userData = await register(registrationData);
      console.log('Received user data:', userData); // Debug log
      
      if (userData) {
        // Registration successful, navigate to login page
        navigate('/login', { 
          state: { 
            message: 'Đăng ký thành công! Vui lòng đăng nhập để tiếp tục.',
            email: formData.email 
          } 
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific error messages
      let errorMessage = 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.';
      
      if (error.message) {
        if (error.message.includes('Validation error:')) {
          // Parse validation errors and translate to Vietnamese
          const validationMsg = error.message.replace('Validation error: ', '');
          const errors = validationMsg.split('; ');
          const translatedErrors = errors.map(err => {
            if (err.includes('username:')) {
              return err.replace('username:', 'Tên đăng nhập:');
            } else if (err.includes('email:')) {
              return err.replace('email:', 'Email:');
            } else if (err.includes('password:')) {
              return err.replace('password:', 'Mật khẩu:');
            } else if (err.includes('confirm_password:')) {
              return err.replace('confirm_password:', 'Xác nhận mật khẩu:');
            } else if (err.includes('first_name:')) {
              return err.replace('first_name:', 'Tên:');
            } else if (err.includes('last_name:')) {
              return err.replace('last_name:', 'Họ:');
            }
            return err;
          });
          errorMessage = translatedErrors.join('; ');
        } else if (error.message.includes('email')) {
          errorMessage = 'Email đã được sử dụng. Vui lòng chọn email khác.';
        } else if (error.message.includes('username')) {
          errorMessage = 'Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.';
        } else if (error.message.includes('password')) {
          errorMessage = 'Mật khẩu không hợp lệ. Vui lòng kiểm tra lại.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setErrors({ submit: errorMessage });
      
      // Fallback to demo registration for development if API is not available
      if (error.message && error.message.includes('Network error')) {
        console.log('API not available, using demo registration');
        localStorage.setItem('isAuthenticated', 'true');
        const displayName = formData.firstName && formData.lastName 
          ? `${formData.firstName} ${formData.lastName}`.trim()
          : formData.firstName || formData.lastName || formData.username;
        localStorage.setItem('userData', JSON.stringify({
          name: displayName,
          first_name: formData.firstName || '',
          last_name: formData.lastName || '',
          username: formData.username,
          email: formData.email,
          role: USER_ROLES.USER,
          accountNumber: Math.random().toString().slice(2, 12),
          balance: '0'
        }));
        navigate('/chat');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Tạo tài khoản mới"
      subtitle="Đăng ký để sử dụng AGRIBANK AI chatbot"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
            Tên đăng nhập *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IoPersonOutline className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="username"
              name="username"
              type="text"
              required              value={formData.username}
              onChange={handleInputChange}              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 text-gray-900 ${
                errors.username ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Nhập tên đăng nhập"
            />
          </div>
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">{errors.username}</p>
          )}
        </div>

        {/* First Name and Last Name */}
        <div className="mb-2">
          <p className="text-sm text-gray-500">Họ tên (không bắt buộc)</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              Tên
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoPersonOutline className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 ${
                  errors.firstName ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Nhập tên"
              />
            </div>
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Họ
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoPersonOutline className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 ${
                  errors.lastName ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="Nhập họ"
              />
            </div>
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>
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
              className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 ${
                errors.email ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="Nhập địa chỉ email"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
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
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
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
                <span className="text-xs text-gray-600 font-medium">{getPasswordStrength(formData.password).label}</span>
              </div>
            </div>
          )}
          
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password}</p>
          )}
          
          {/* Password Requirements */}
          {(showPasswordRequirements || formData.password) && (
            <div className="mt-2 text-xs text-gray-600 animate-fade-in">
              <p className="mb-1 font-medium">Mật khẩu phải có:</p>
              <ul className="space-y-0.5 pl-3">
                <li className={formData.password.length >= 8 ? 'text-green-600 font-medium' : ''}>
                  • Ít nhất 8 ký tự
                </li>
                <li className={/(?=.*[a-z])/.test(formData.password) ? 'text-green-600 font-medium' : ''}>
                  • Ít nhất 1 chữ cái thường
                </li>
                <li className={/(?=.*[A-Z])/.test(formData.password) ? 'text-green-600 font-medium' : ''}>
                  • Ít nhất 1 chữ cái hoa
                </li>
                <li className={/(?=.*\d)/.test(formData.password) ? 'text-green-600 font-medium' : ''}>
                  • Ít nhất 1 số
                </li>
                <li className={/(?=.*[@$!%*?&])/.test(formData.password) ? 'text-green-600 font-medium' : ''}>
                  • Ít nhất 1 ký tự đặc biệt
                </li>
              </ul>
            </div>
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
              className={`pl-10 pr-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 ${
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

        {/* Error message */}
        {errors.submit && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{errors.submit}</p>
          </div>
        )}

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
