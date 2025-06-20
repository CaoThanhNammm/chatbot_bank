import React, { useEffect, useState } from 'react';
import { IoCheckmarkCircleOutline, IoCloseOutline, IoWarningOutline, IoInformationCircleOutline } from 'react-icons/io5';

const Toast = ({ 
  isOpen, 
  onClose, 
  title = "Thông báo", 
  message = "",
  type = "success", // success, error, warning, info
  duration = 3000,
  position = "top-right" // top-right, top-left, bottom-right, bottom-left
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsLeaving(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300); // Animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <IoCheckmarkCircleOutline size={20} className="text-green-500" />;
      case 'error':
        return <IoCloseOutline size={20} className="text-red-500" />;
      case 'warning':
        return <IoWarningOutline size={20} className="text-yellow-500" />;
      case 'info':
        return <IoInformationCircleOutline size={20} className="text-blue-500" />;
      default:
        return <IoCheckmarkCircleOutline size={20} className="text-green-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-right-below-header':
        return 'top-16 right-4'; // Dưới header nhưng trên model selector
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      default:
        return 'top-4 right-4';
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`
        fixed z-[75] max-w-sm w-full mx-4 p-4 rounded-lg shadow-lg border
        ${getBackgroundColor()}
        ${getPositionClasses()}
        transform transition-all duration-300 ease-in-out
        ${isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
      `}
    >
      <div className="flex items-start space-x-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 mb-1">
            {title}
          </h4>
          {message && (
            <p className="text-sm text-gray-600">
              {message}
            </p>
          )}
        </div>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 transition-colors duration-200"
          aria-label="Đóng thông báo"
        >
          <IoCloseOutline size={16} className="text-gray-400" />
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="mt-3 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
        <div 
          className={`h-1 rounded-full transition-all ease-linear ${
            type === 'success' ? 'bg-green-500' :
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' :
            'bg-blue-500'
          }`}
          style={{
            width: '100%',
            animation: `toast-progress ${duration}ms linear forwards`
          }}
        />
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes toast-progress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `
      }} />
    </div>
  );
};

export default Toast;