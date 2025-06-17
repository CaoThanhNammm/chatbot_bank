import api from './api';
import { STORAGE_KEYS } from '../constants/api';

// Admin and Staff role constants
export const USER_ROLES = {
  USER: 'user',
  STAFF: 'staff', 
  ADMIN: 'admin'
};

export const PERMISSIONS = {
  MANAGE_USERS: 'manage_users',
  MANAGE_FINE_TUNING: 'manage_fine_tuning',
  UPLOAD_TRAINING_FILES: 'upload_training_files',
  VIEW_ADMIN_PANEL: 'view_admin_panel'
};

export const ROLE_PERMISSIONS = {
  [USER_ROLES.USER]: [],
  [USER_ROLES.STAFF]: [],
  [USER_ROLES.ADMIN]: [
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_FINE_TUNING,
    PERMISSIONS.UPLOAD_TRAINING_FILES,
    PERMISSIONS.VIEW_ADMIN_PANEL
  ]
};

// Check if user has specific permission
export const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Get user role from localStorage or API
export const getCurrentUserRole = () => {
  try {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsed = JSON.parse(userData);
      return parsed.role || USER_ROLES.USER;
    }
    return USER_ROLES.USER;
  } catch (error) {
    console.error('Error getting user role:', error);
    return USER_ROLES.USER;
  }
};

// Set user role (for demo purposes)
export const setUserRole = (role) => {
  try {
    const existingData = localStorage.getItem('userData');
    const userData = existingData ? JSON.parse(existingData) : {};
    userData.role = role;
    localStorage.setItem('userData', JSON.stringify(userData));
  } catch (error) {
    console.error('Error setting user role:', error);
  }
};

// Demo accounts for testing different roles
export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@vietbank.com',
    password: 'admin123456',
    role: USER_ROLES.ADMIN,
    name: 'Admin VietBank',
    first_name: 'Admin',
    last_name: 'VietBank',
    phone: '0123456789',
    department: 'IT Administration'
  },
  staff: {
    email: 'staff@vietbank.com', 
    password: 'staff123456',
    role: USER_ROLES.STAFF,
    name: 'Nhân viên VietBank',
    first_name: 'Nhân viên',
    last_name: 'VietBank',
    phone: '0987654321',
    department: 'Training Department'
  },
  user: {
    email: 'user@gmail.com',
    password: 'user123456', 
    role: USER_ROLES.USER,
    name: 'Khách hàng VietBank',
    first_name: 'Khách hàng',
    last_name: 'VietBank',
    phone: '0999888777',
    department: null
  }
};

// Validate login credentials
export const validateLogin = (email, password) => {
  const accounts = Object.values(DEMO_ACCOUNTS);
  const account = accounts.find(acc => 
    acc.email === email && acc.password === password
  );
  return account || null;
};

// Login function - now using real API
export const login = async (email, password, rememberMe = false) => {
  try {
    const response = await api.auth.login({ 
      username_or_email: email, 
      password: password,
      remember_me: rememberMe ? "true" : "false"
    });
    
    if (response.success && response.data && response.data.data) {
      // Set authentication state and user data
      const userData = response.data.data.user;
      const token = response.data.data.token;
      
      localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      localStorage.setItem(STORAGE_KEYS.TOKEN, token);
      
      return userData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};

// Login function (fallback to demo for development)
export const loginDemo = (email, password) => {
  const account = validateLogin(email, password);
  if (account) {
    // Save user data to localStorage
    const userData = {
      id: Date.now(),
      name: account.name,
      first_name: account.first_name,
      last_name: account.last_name,
      email: account.email,
      phone: account.phone,
      role: account.role,
      department: account.department,
      accountNumber: Math.random().toString().slice(2, 12),
      balance: account.role === USER_ROLES.USER ? '125,750,000' : null,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    localStorage.setItem(STORAGE_KEYS.IS_AUTHENTICATED, 'true');
    return userData;
  }
  return null;
};

// Register function
export const register = async (userData) => {
  try {
    console.log('Sending registration request with data:', userData); // Debug log
    const response = await api.auth.register(userData);
    console.log('API Response:', response); // Debug log
    console.log('Response success:', response.success); // Debug log
    console.log('Response data:', response.data); // Debug log
    
    // Check if the API call was successful
    // Your API returns { success: true, message: "...", user: {...} }
    // Our ApiResponse wraps it as { success: boolean, data: {...}, error: null }
    if (response.success && response.data && response.data.success) {
      // Registration successful - don't auto-login, just return user data
      if (response.data.user) {
        return response.data.user;
      }
      
      return response.data;
    } else if (response.success && response.data) {
      // Fallback: if our wrapper says success but no nested success
      if (response.data.user) {
        return response.data.user;
      }
      
      return response.data;
    } else {
      // Handle error cases
      let errorMessage = response.error || 
                        (response.data && response.data.message) || 
                        'Registration failed';
      
      // If there are detailed validation errors, format them
      if (response.data && response.data.errors) {
        const validationErrors = response.data.errors;
        const errorDetails = [];
        
        // Format validation errors into readable messages
        for (const [field, messages] of Object.entries(validationErrors)) {
          if (Array.isArray(messages)) {
            errorDetails.push(`${field}: ${messages.join(', ')}`);
          } else {
            errorDetails.push(`${field}: ${messages}`);
          }
        }
        
        if (errorDetails.length > 0) {
          errorMessage = `Validation error: ${errorDetails.join('; ')}`;
        }
      }
      
      console.error('Registration failed:', errorMessage);
      console.error('Full response:', response);
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    await api.auth.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  // Clear local storage
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.IS_AUTHENTICATED);
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await api.auth.getProfile();
    
    if (response.success && response.data) {
      // API returns { success: true, user: {...} }
      const userData = response.data.user || response.data;
      
      // Update localStorage with fresh data
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      return userData;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Fallback to localStorage
  const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return userData ? JSON.parse(userData) : null;
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.auth.updateProfile(profileData);
    if (response.success) {
      // Update localStorage
      localStorage.setItem('userData', JSON.stringify(response.data));
      return response.data;
    }
    return null;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const authState = localStorage.getItem(STORAGE_KEYS.IS_AUTHENTICATED);
  return !!(token || authState === 'true');
};
