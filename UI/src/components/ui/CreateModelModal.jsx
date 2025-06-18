import React, { useState, useEffect } from 'react';
import { IoClose, IoSettings } from 'react-icons/io5';
import { Button } from '../ui';
import { TRAINING_DOMAINS } from '../../data/adminData';

const CreateModelModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    trainingData: '',
    description: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        domain: '',
        trainingData: '',
        description: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên mô hình không được để trống';
    }

    if (!formData.domain) {
      newErrors.domain = 'Vui lòng chọn lĩnh vực';
    }

    if (!formData.trainingData.trim()) {
      newErrors.trainingData = 'File dữ liệu huấn luyện không được để trống';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả không được để trống';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const modelData = {
      ...formData,
      id: Date.now(),
      status: 'pending',
      accuracy: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      creator: 'Current User' // In real app, get from auth
    };

    onSave(modelData);
    onClose();
  };

  const handleClose = () => {
    setFormData({
      name: '',
      domain: '',
      trainingData: '',
      description: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Tạo mô hình mới
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <IoClose size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Model Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên mô hình *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IoSettings className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`pl-10 w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
                placeholder="VD: AGRIBANK Customer Service v2.0"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lĩnh vực *
            </label>
            <select
              value={formData.domain}
              onChange={(e) => handleInputChange('domain', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 ${
                errors.domain ? 'border-red-300' : 'border-gray-200'
              }`}
            >
              <option value="">Chọn lĩnh vực</option>
              {TRAINING_DOMAINS.map(domain => (
                <option key={domain.value} value={domain.value}>
                  {domain.label}
                </option>
              ))}
            </select>
            {errors.domain && (
              <p className="mt-1 text-sm text-red-600">{errors.domain}</p>
            )}
          </div>

          {/* Training Data */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File dữ liệu huấn luyện *
            </label>
            <input
              type="text"
              value={formData.trainingData}
              onChange={(e) => handleInputChange('trainingData', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 ${
                errors.trainingData ? 'border-red-300' : 'border-gray-200'
              }`}
              placeholder="VD: customer_service_data_2024.jsonl"
            />
            {errors.trainingData && (
              <p className="mt-1 text-sm text-red-600">{errors.trainingData}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent text-gray-900 resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-200'
              }`}
              rows={3}
              placeholder="Mô tả mục đích và tính năng của mô hình..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Lưu ý:</strong> Mô hình sẽ được tạo với trạng thái "Chờ xử lý" và cần được huấn luyện trước khi có thể sử dụng.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Tạo mô hình
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateModelModal;
