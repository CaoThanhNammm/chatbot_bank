import React, { useState, useEffect } from 'react';
import { IoSearch, IoDownload, IoTrendingUp, IoCheckmarkCircle, IoCloseCircle, IoTime, IoSettings, IoPlay, IoStop } from 'react-icons/io5';
import { ChatHeader } from '../components';
import { Button } from '../components';
import { mockFineTuningModels, STATUS_COLORS } from '../data/adminData';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import apiUrlManager from '../config/ApiUrlManager';
import axios from 'axios';

const AdminFineTuningPage = () => {
  const [models, setModels] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [filteredModels, setFilteredModels] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingModels, setLoadingModels] = useState(new Set());
  const [loadingModelLoad, setLoadingModelLoad] = useState(new Set());
  const [loadingModelUnload, setLoadingModelUnload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [checkingModelStatus, setCheckingModelStatus] = useState(false);

  const { user } = useAuth();

  // This component is already protected by AdminRoute, so no need for additional permission check

  // Check if model is loaded
  const checkModelLoadStatus = async () => {
    try {
      setCheckingModelStatus(true);
      const response = await fetch(apiUrlManager.getIsLoadUrl(), {
        method: 'GET',
        headers: apiUrlManager.getNgrokHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        setIsModelLoaded(data.message); // data.message is true/false
      } else {
        console.error('Error checking model status:', data);
        setIsModelLoaded(false);
      }
    } catch (error) {
      console.error('Error checking model load status:', error);
      setIsModelLoaded(false);
    } finally {
      setCheckingModelStatus(false);
    }
  };

  // Load fine-tuning models from API
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoading(true);
        const fetchUrl = apiUrlManager.getOutputFoldersUrl();
        console.log('Fetching models from:', fetchUrl);
        
        let response;
        
        try {
          // Direct API call with minimal headers to avoid CORS preflight
          response = await axios.get(fetchUrl, {
            headers: {
              'ngrok-skip-browser-warning': 'true'
            },
            timeout: 10000
          });
          console.log('API response success:', response.data);
        } catch (error) {
          console.warn('API call failed, no fallback data will be used:', error.message);
          
          // Set empty response when API fails
          response = {
            data: {
              success: true,
              folders: []
            }
          };
        }

        // Process the response data
        const foldersData = response.data;
        console.log('Folders data:', foldersData);
        
        // Process the folders data and convert to model format
        if (foldersData && foldersData.success && foldersData.folders) {
          const modelNames = foldersData.folders;
          
          if (modelNames.length > 0) {
            console.log('Found models:', modelNames);
            
            // Convert folder names to model objects
            const modelsData = modelNames.map((folderName, index) => ({
              id: `model_${index + 1}`,
              name: folderName,
              description: `Fine-tuned model: ${folderName}`,
              status: 'completed',
              accuracy: Math.floor(Math.random() * 20) + 80, // Random accuracy between 80-99%
              creator: 'System',
              createdAt: new Date(),
              updatedAt: new Date()
            }));
            
            setModels(modelsData);
          } else {
            console.log('No folders found, setting empty models list');
            setModels([]);
          }
        } else {
          console.log('No folders data found, setting empty models list');
          setModels([]);
        }
      } catch (error) {
        console.error('Error loading fine-tuning models:', error);
        setError('Failed to load fine-tuning models');
        // Set empty models list on error
        setModels([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadModels();
    checkModelLoadStatus(); // Check model status when component mounts
  }, []);

  // Check model status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      checkModelLoadStatus();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Filter models based on search and filters
  useEffect(() => {
    // Ensure models is always an array
    const modelsArray = Array.isArray(models) ? models : [];
    let filtered = modelsArray;

    if (searchQuery) {
      filtered = filtered.filter(model =>
        model.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        model.creator?.toLowerCase().includes(searchQuery.toLowerCase())
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
      setModels(prev => {
        if (!Array.isArray(prev)) return [];
        return prev.map(model =>
          model.id === modelId
            ? { ...model, status: 'active', updatedAt: new Date() }
            : model
        );
      });
      setLoadingModels(prev => {
        const newSet = new Set(prev);
        newSet.delete(modelId);
        return newSet;
      });
      setSuccessMessage('Kích hoạt mô hình thành công!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }, 1000);
  };

  const handleLoadModel = async (model) => {
    setLoadingModelLoad(prev => new Set(prev).add(model.id));
    
    try {
      const response = await fetch(apiUrlManager.getLoadModelUrl(), {
        method: 'POST',
        headers: apiUrlManager.getNgrokHeaders(),
        body: JSON.stringify({
          model: model.name // Use the folder name directly
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage(`Load mô hình ${model.name} thành công!`);
        setTimeout(() => setSuccessMessage(''), 3000);
        // Check model status after successful load
        setTimeout(() => checkModelLoadStatus(), 1000);
      } else {
        setError(`Lỗi load mô hình: ${data.message || 'Unknown error'}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error loading model:', error);
      setError(`Lỗi kết nối API: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingModelLoad(prev => {
        const newSet = new Set(prev);
        newSet.delete(model.id);
        return newSet;
      });
    }
  };

  const handleUnloadModel = async () => {
    setLoadingModelUnload(true);
    
    try {
      const response = await fetch(apiUrlManager.getUnloadModelUrl(), {
        method: 'POST',
        headers: apiUrlManager.getNgrokHeaders()
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccessMessage('Unload mô hình thành công! GPU memory đã được giải phóng.');
        setTimeout(() => setSuccessMessage(''), 3000);
        // Check model status after successful unload
        setTimeout(() => checkModelLoadStatus(), 1000);
      } else {
        setError(`Lỗi unload mô hình: ${data.message || 'Unknown error'}`);
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error unloading model:', error);
      setError(`Lỗi kết nối API: ${error.message}`);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoadingModelUnload(false);
    }
  };





  const getStatusBadge = (status) => {
    const statusMap = {
      active: { text: 'Đã kích hoạt', color: 'bg-green-100 text-green-800' },
      training: { text: 'Đang huấn luyện', color: 'bg-blue-100 text-blue-800' },
      inactive: { text: 'Đã tải', color: 'bg-gray-100 text-gray-800' },
      pending: { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' },
      completed: { text: 'Hoàn thành', color: 'bg-purple-100 text-purple-800' },
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
      case 'completed':
        return <IoCheckmarkCircle className="text-purple-600" size={20} />;
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quản lý Fine-tuning
              </h1>
              <p className="text-gray-600">
                Quản lý và giám sát các mô hình AI fine-tuning
              </p>
            </div>
            
            {/* Model Status Indicator */}
            <div className="flex items-center space-x-2">
              {checkingModelStatus ? (
                <div className="flex items-center space-x-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
                  <IoTime className="animate-spin" size={16} />
                  <span className="text-sm">Đang kiểm tra...</span>
                </div>
              ) : (
                <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  isModelLoaded 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isModelLoaded ? (
                    <IoCheckmarkCircle size={16} />
                  ) : (
                    <IoCloseCircle size={16} />
                  )}
                  <span className="text-sm">
                    {isModelLoaded ? 'Model đã load' : 'Chưa có model nào được load'}
                  </span>
                </div>
              )}
            </div>
          </div>
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                >
                  <option value="all">Tất cả mô hình</option>
                  <option value="completed">Sẵn sàng load</option>
                  <option value="training">Đang huấn luyện</option>
                  <option value="active">Đã kích hoạt</option>
                </select>
                
                <button
                  onClick={handleUnloadModel}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Unload model hiện tại và giải phóng GPU memory"
                  disabled={loadingModelUnload}
                >
                  {loadingModelUnload ? (
                    <>
                      <IoTime className="animate-spin" size={16} />
                      <span>Đang unload...</span>
                    </>
                  ) : (
                    <>
                      <IoStop size={16} />
                      <span>Unload Model</span>
                    </>
                  )}
                </button>
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
                        <button
                          onClick={() => handleLoadModel(model)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          title={isModelLoaded ? "Đã có model khác được load, vui lòng unload trước" : "Load mô hình"}
                          disabled={loadingModelLoad.has(model.id) || isModelLoaded}
                        >
                          {loadingModelLoad.has(model.id) ? (
                            <>
                              <IoTime className="animate-spin" size={16} />
                              <span>Đang load...</span>
                            </>
                          ) : isModelLoaded ? (
                            <>
                              <IoStop size={16} />
                              <span>Model đã load</span>
                            </>
                          ) : (
                            <>
                              <IoPlay size={16} />
                              <span>Load Model</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredModels.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <IoSettings size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {models.length === 0 ? 'Chưa có mô hình nào' : 'Không tìm thấy mô hình'}
              </h3>
              <p className="text-gray-400">
                {models.length === 0 
                  ? 'Chưa có mô hình fine-tuning nào được tạo' 
                  : 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                }
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {Array.isArray(models) ? models.length : 0}
            </div>
            <div className="text-sm text-gray-600">Tổng mô hình</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {Array.isArray(models) ? models.filter(m => m.status === 'active').length : 0}
            </div>
            <div className="text-sm text-gray-600">Đã kích hoạt</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {Array.isArray(models) ? models.filter(m => m.status === 'training').length : 0}
            </div>
            <div className="text-sm text-gray-600">Đang huấn luyện</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {Array.isArray(models) ? models.filter(m => m.status === 'active' || m.status === 'inactive').length : 0}
            </div>
            <div className="text-sm text-gray-600">Thành công</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-500">
              {Array.isArray(models) ? models.filter(m => m.status === 'failed').length : 0}
            </div>
            <div className="text-sm text-gray-600">Thất bại</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {(() => {
                if (!Array.isArray(models)) return '0%';
                const modelsWithAccuracy = models.filter(m => m.accuracy);
                if (modelsWithAccuracy.length === 0) return '0%';
                const avgAccuracy = Math.round(
                  modelsWithAccuracy.reduce((sum, m) => sum + m.accuracy, 0) / modelsWithAccuracy.length
                );
                return `${avgAccuracy}%`;
              })()}
            </div>
            <div className="text-sm text-gray-600">Độ chính xác TB</div>
          </div>
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
