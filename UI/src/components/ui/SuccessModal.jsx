import React, { useEffect } from 'react';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import Modal from './Modal';
import Button from './Button';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = "Thành công!", 
  message = "Hành động đã được thực hiện thành công.",
  buttonText = "Đóng",
  autoClose = true,
  autoCloseDelay = 3000
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      showCloseButton={false}
      className="max-w-md"
    >
      <div className="text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <IoCheckmarkCircleOutline size={32} className="text-green-500" />
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title}
        </h3>
        
        {/* Message */}
        <p className="text-gray-600 mb-6">
          {message}
        </p>
        
        {/* Button */}
        <Button
          variant="primary"
          onClick={onClose}
          className="px-6 py-2"
        >
          {buttonText}
        </Button>
        
        {/* Auto close indicator */}
        {autoClose && (
          <p className="text-xs text-gray-400 mt-3">
            Tự động đóng sau {autoCloseDelay / 1000} giây
          </p>
        )}
      </div>
    </Modal>
  );
};

export default SuccessModal;