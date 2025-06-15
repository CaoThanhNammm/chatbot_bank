import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChatPage from './pages/ChatPage';
import GuestChatPage from './pages/GuestChatPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminFineTuningPage from './pages/AdminFineTuningPage';
import StaffTrainingPage from './pages/StaffTrainingPage';
import ProtectedRoute from './routes/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/guest-chat" element={<GuestChatPage />} />
          
          {/* Protected Routes */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          
          {/* Admin Routes */}
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fine-tuning"
            element={
              <ProtectedRoute>
                <AdminFineTuningPage />
              </ProtectedRoute>
            }
          />
          
          {/* Staff Routes */}
          <Route
            path="/staff/training"
            element={
              <ProtectedRoute>
                <StaffTrainingPage />
              </ProtectedRoute>
            }
          />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
