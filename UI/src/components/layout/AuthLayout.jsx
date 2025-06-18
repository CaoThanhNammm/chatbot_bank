import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo và tiêu đề */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white text-2xl font-bold">🏦</span>
          </div>
          <h2 className="mt-6 text-3xl font-display font-extrabold text-red-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-2 text-sm text-red-700">
              {subtitle}
            </p>
          )}
        </div>
        
        {/* Nội dung form */}
        <div className="mt-8 bg-white py-8 px-6 shadow-xl rounded-lg border border-red-100">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
