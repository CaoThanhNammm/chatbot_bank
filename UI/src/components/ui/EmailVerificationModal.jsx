import React from 'react';
import { IoMail, IoCheckmarkCircle } from 'react-icons/io5';
import Modal from './Modal';
import Button from './Button';

const EmailVerificationModal = ({ isOpen, onClose, email }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác thực email"
      showCloseButton={false}
      className="max-w-lg"
    >
      <div className="text-center">
        {/* Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <IoMail className="w-8 h-8 text-blue-600" />
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Đăng ký thành công!
        </h3>
        
        {/* Message */}
        <div className="text-gray-600 mb-6 space-y-2">
          <p>
            Chúng tôi đã gửi email xác thực đến địa chỉ:
          </p>
          <p className="font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
            {email}
          </p>
          <p>
            Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác thực để kích hoạt tài khoản của bạn.
          </p>
        </div>
        
        {/* Instructions */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <IoCheckmarkCircle className="w-4 h-4 text-green-500 mr-2" />
            Hướng dẫn:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Kiểm tra hộp thư đến (Inbox)</li>
            <li>• Nếu không thấy email, hãy kiểm tra thư mục Spam/Junk</li>
            <li>• Nhấp vào liên kết "Kích hoạt tài khoản" trong email</li>
            <li>• Sau khi kích hoạt, bạn có thể đăng nhập bình thường</li>
          </ul>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onClose}
            className="flex-1"
          >
            Tôi đã hiểu
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // Open email client
              window.location.href = `mailto:${email}`;
            }}
            className="flex-1"
          >
            Mở ứng dụng Email
          </Button>
        </div>
        
        {/* Footer note */}
        <p className="text-xs text-gray-500 mt-4">
          Nếu bạn không nhận được email sau 5 phút, vui lòng liên hệ bộ phận hỗ trợ.
        </p>
      </div>
    </Modal>
  );
};

export default EmailVerificationModal;