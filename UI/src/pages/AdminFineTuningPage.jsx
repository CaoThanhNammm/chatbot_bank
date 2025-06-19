import React, { useState, useEffect } from 'react';
import { IoSearch, IoDownload, IoTrendingUp, IoCheckmarkCircle, IoCloseCircle, IoTime } from 'react-icons/io5';
import { ChatHeader } from '../components';
import { Button } from '../components';
import { mockFineTuningModels, STATUS_COLORS } from '../data/adminData';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const AdminFineTuningPage = () => {
  const [models, setModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filteredModels, setFilteredModels] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingModels, setLoadingModels] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const { user } = useAuth();

  // This component is already protected by AdminRoute, so no need for additional permission check

  // Load fine-tuning models from API
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const response = await api.fineTuning.getModels();
        
        if (response.success) {
          setModels(response.data);
        } else {
          // Fallback to mock data for development
          console.warn('Fine-tuning models API failed, using mock data:', response.error);
          setModels(mockFineTuningModels);
        }
      } catch (error) {
        console.error('Error loading fine-tuning models:', error);
        setError('Failed to load fine-tuning models');
        // Fallback to mock data
        setModels(mockFineTuningModels);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
  }, []);

  // Filter models based on search and filters
  useEffect(() => {
    let filtered = models;

    if (searchQuery) {
      filtered = filtered.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.creator.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(model => model.status === selectedStatus);
    }

    setFilteredModels(filtered);
  }, [models, searchQuery, selectedStatus]);

  const handleActivateModel = (modelId) => {
    setLoadingModels(prev => new Set(prev).add(modelId));
    
    setTimeout(() => {
      setModels(prev => prev.map(model =>
        model.id === modelId
          ? { ...model, status: 'active', updatedAt: new Date() }
          : model
      ));
      setLoadingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      setSuccessMessage('Kích hoạt mô hình thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };





  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: 'Đã kích hoạt', color: 'bg-green-100 text-green-800' },
      training: { text: 'Đang huấn luyện', color: 'bg-blue-100 text-blue-800' },
      inactive: { text: 'Đã tải', color: 'bg-gray-100 text-gray-800' },
      pending: { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      failed: { text: 'Thất bại', color: 'bg-red-100 text-red-800' }
    };

    const statusInfo = statusMap[status] || statusMap.inactive;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };



  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <IoCheckmarkCircle className="text-red-600" size={20} />;
      case 'training':
        return <IoTime className="text-red-600" size={20} />;
      case 'failed':
        return <IoCloseCircle className="text-red-500" size={20} />;
      default:
        return <IoTime className="text-gray-500" size={20} />;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <ChatHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý Fine-tuning
          </h1>
          <p className="text-gray-600">
            Quản lý và giám sát các mô hình AI fine-tuning
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <IoCloseCircle className="text-red-500 mr-2" size={20} />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <IoCheckmarkCircle className="text-red-600 mr-2" size={20} />
              <span className="text-red-800">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {/* Filters and Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <IoSearch size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm mô hình..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="training">Đang huấn luyện</option>
                  <option value="inactive">Đã tải</option>
                  <option value="active">Đã kích hoạt</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Models Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mô hình
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Độ chính xác
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredModels.map((model) => (
                  <tr key={model.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          {getStatusIcon(model.status)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {model.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {model.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {model.accuracy ? (
                        <div className="flex items-center">
                          <IoTrendingUp size={14} className="mr-1 text-red-600" />
                          {model.accuracy}%
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(model.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {model.creator}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {(model.status === 'inactive' || model.status === 'pending') && (
                          <button
                            onClick={() => handleActivateModel(model.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                            title="Kích hoạt mô hình"
                            disabled={loadingModels.has(model.id)}
                          >
                            {loadingModels.has(model.id) ? <IoTime className="animate-spin" /> : <IoCheckmarkCircle size={18} />}
                          </button>
                        )}
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Tải xuống"
                        >
                          <IoDownload size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredModels.length === 0 && (
            <div className="text-center py-12">
              <IoSettings size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Không tìm thấy mô hình
              </h3>
              <p className="text-gray-400">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {models.length}
            </div>
            <div className="text-sm text-gray-600">Tổng mô hình</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {models.filter(m => m.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Đã kích hoạt</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {models.filter(m => m.status === 'training').length}
            </div>
            <div className="text-sm text-gray-600">Đang huấn luyện</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(models.filter(m => m.accuracy).reduce((sum, m) => sum + m.accuracy, 0) / models.filter(m => m.accuracy).length) || 0}%            </div>
            <div className="text-sm text-gray-600">Độ chính xác TB</div>          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mt-4 p-4 bg-red-100 text-red-800 rounded-lg">
            {successMessage}
          </div>
        )}
          </>
        )}
      </div>


    </div>
  );
};

export default AdminFineTuningPage;
