import api from './api';

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
  [USER_ROLES.STAFF]: [
    PERMISSIONS.UPLOAD_TRAINING_FILES
  ],
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
    password: 'admin123',
    role: USER_ROLES.ADMIN,
    name: 'Admin VietBank',
    phone: '0123456789',
    department: 'IT Administration'
  },
  staff: {
    email: 'staff@vietbank.com', 
    password: 'staff123',
    role: USER_ROLES.STAFF,
    name: 'Nhân viên VietBank',
    phone: '0987654321',
    department: 'Training Department'
  },
  user: {
    email: 'user@gmail.com',
    password: 'user123', 
    role: USER_ROLES.USER,
    name: 'Khách hàng VietBank',
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
export const login = async (email, password) => {
  try {
    const response = await api.auth.login({ email, password });
    
    if (response.success) {
      // Set authentication state
      localStorage.setItem('isAuthenticated', 'true');
      return response.data.user;
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
      email: account.email,
      phone: account.phone,
      role: account.role,
      department: account.department,
      accountNumber: Math.random().toString().slice(2, 12),
      balance: account.role === USER_ROLES.USER ? '125,750,000' : null,
      loginTime: new Date().toISOString()
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('isAuthenticated', 'true');
    return userData;
  }
  return null;
};

// Register function
export const register = async (userData) => {
  try {
    const response = await api.auth.register(userData);
    
    if (response.success) {
      // Auto-login after successful registration
      localStorage.setItem('isAuthenticated', 'true');
      return response.data.user;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Registration error:', error);
    return null;
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
  localStorage.removeItem('token');
  localStorage.removeItem('userData');
  localStorage.removeItem('isAuthenticated');
};

// Get current user profile
export const getCurrentUser = async () => {
  try {
    const response = await api.auth.getProfile();
    if (response.success) {
      return response.data;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  
  // Fallback to localStorage
  const userData = localStorage.getItem('userData');
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
  const token = localStorage.getItem('token');
  const authState = localStorage.getItem('isAuthenticated');
  return !!(token || authState === 'true');
};
