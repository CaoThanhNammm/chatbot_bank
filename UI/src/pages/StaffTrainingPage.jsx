import React, { useState, useEffect, useRef } from 'react';
import { IoCloudUpload, IoDocument, IoCheckmarkCircle, IoCloseCircle, IoTime, IoTrash, IoDownload, IoEye, IoWarning, IoPlay, IoSettings } from 'react-icons/io5';
import { ChatHeader } from '../components';
import { Button } from '../components';
import { mockTrainingFiles, TRAINING_DOMAINS, STATUS_COLORS } from '../data/adminData';
import { useAuth } from '../contexts/AuthContext';

const StaffTrainingPage = () => {
  // Fine-tuning form state
  const [formData, setFormData] = useState({
    datasetFile: null,
    modelNameOrPath: 'meta-llama/Meta-Llama-3-8B-Instruct',
    template: 'llama3',
    outputDir: 'llama3_lora_qa_human_hybrid',
    finetuningType: 'lora',
    loraTarget: 'all',
    perDeviceTrainBatchSize: 2,
    gradientAccumulationSteps: 4,
    lrSchedulerType: 'cosine',
    loggingSteps: 5,
    warmupRatio: 0.1,
    saveSteps: 1000,
    learningRate: 0.00005,
    numTrainEpochs: 3.0,
    maxSamples: 500,
    maxGradNorm: 1.0,
    loraplusLrRatio: 16.0,
    fp16: true,
    reportTo: 'none'
  });
  
  const [trainingFiles, setTrainingFiles] = useState(mockTrainingFiles);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingError, setTrainingError] = useState('');
  const [trainingResult, setTrainingResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Redirect if user is not admin
  useEffect(() => {
    if (!user || !user.is_admin) {
      window.location.href = '/chat';
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        datasetFile: file
      }));
    }
  };

  // Handle fine-tuning form submission
  const handleFinetuneSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.datasetFile) {
      setTrainingError('Vui lòng chọn file CSV để huấn luyện');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingError('');
    setTrainingResult(null);

    try {
      // Create FormData for API request
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'datasetFile') {
          formDataToSend.append('dataset_file', formData[key]);
        } else {
          // Convert camelCase to snake_case for API
          const apiKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
          formDataToSend.append(apiKey, formData[key]);
        }
      });

      // Simulate training progress
      const progressInterval = setInterval(() => {
        setTrainingProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + Math.random() * 10;
        });
      }, 1000);

      // Simulate API call to backend
      const response = await fetch('http://localhost:5000/api/finetune', {
        method: 'POST',
        body: formDataToSend
      });

      const result = await response.json();
      
      clearInterval(progressInterval);
      setTrainingProgress(100);
      setIsTraining(false);
      setTrainingResult(result);
      
      if (result.success) {
        setSuccessMessage('Huấn luyện mô hình hoàn thành thành công!');
        // Add to training files list
        const newFile = {
          id: Date.now(),
          name: formData.datasetFile.name,
          domain: 'fine_tuning',
          size: (formData.datasetFile.size / (1024 * 1024)).toFixed(1),
          status: 'processing',
          uploadedAt: new Date(),
          uploadedBy: 'Current User',
          description: `Fine-tuning với ${formData.modelNameOrPath}`
        };
        setTrainingFiles(prev => [newFile, ...prev]);
      } else {
        setTrainingError(result.message || 'Có lỗi xảy ra trong quá trình huấn luyện');
      }
    } catch (error) {
      console.error('Training error:', error);
      setIsTraining(false);
      setTrainingProgress(0);
      setTrainingError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
    }
  };

  const handleDeleteFile = (fileId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa file này?')) {
      setTrainingFiles(prev => prev.filter(file => file.id !== fileId));
    }
  };

  const formatFileSize = (sizeInMB) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      uploaded: { text: 'Đã tải lên', color: 'bg-green-100 text-green-800' },
      processing: { text: 'Đang xử lý', color: 'bg-blue-100 text-blue-800' },
      failed: { text: 'Thất bại', color: 'bg-red-100 text-red-800' }
    };

    const statusInfo = statusMap[status] || statusMap.uploaded;
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getDomainBadge = (domain) => {
    const domainInfo = TRAINING_DOMAINS.find(d => d.value === domain) || 
                     { label: domain, color: 'gray' };
    
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      gray: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colorMap[domainInfo.color]}`}>
        {domainInfo.label}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'uploaded':
        return <IoCheckmarkCircle className="text-green-500" size={20} />;
      case 'processing':
        return <IoTime className="text-blue-500" size={20} />;
      case 'failed':
        return <IoCloseCircle className="text-red-500" size={20} />;
      default:
        return <IoDocument className="text-gray-500" size={20} />;
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <ChatHeader />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Fine-tuning Model với CSV Upload
          </h1>
          <p className="text-gray-600">
            Huấn luyện mô hình AI với dữ liệu tùy chỉnh
          </p>
        </div>

        {/* Fine-tuning Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <IoSettings className="text-blue-500 mr-2" size={24} />
              <h2 className="text-lg font-semibold text-gray-900">
                Cấu hình Fine-tuning
              </h2>
            </div>
            
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <IoCheckmarkCircle className="text-green-500 mr-2" size={20} />
                  <span className="text-green-800">{successMessage}</span>
                </div>
              </div>
            )}

            {/* Error Message */}
            {trainingError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <IoWarning className="text-red-500 mr-2" size={20} />
                  <span className="text-red-800">{trainingError}</span>
                </div>
              </div>
            )}

            {/* Training Progress */}
            {isTraining && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center mb-2">
                  <IoPlay className="text-blue-500 mr-2" size={20} />
                  <span className="text-blue-800 font-medium">Đang huấn luyện... {Math.round(trainingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${trainingProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Training Result */}
            {trainingResult && (
              <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Kết quả:</h3>
                <pre className="text-xs text-gray-600 overflow-x-auto">
                  {JSON.stringify(trainingResult, null, 2)}
                </pre>
              </div>
            )}
            
            <form onSubmit={handleFinetuneSubmit} className="space-y-6">
              {/* File Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CSV File *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  {formData.datasetFile && (
                    <p className="mt-1 text-sm text-green-600">
                      File đã chọn: {formData.datasetFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Name hoặc Path *
                  </label>
                  <input
                    type="text"
                    name="modelNameOrPath"
                    value={formData.modelNameOrPath}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Template
                  </label>
                  <input
                    type="text"
                    name="template"
                    value={formData.template}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output Directory
                  </label>
                  <input
                    type="text"
                    name="outputDir"
                    value={formData.outputDir}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fine-tuning Type
                  </label>
                  <select
                    name="finetuningType"
                    value={formData.finetuningType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="lora">LoRA</option>
                    <option value="full">Full Fine-tuning</option>
                    <option value="qlora">QLoRA</option>
                  </select>
                </div>
              </div>

              {/* LoRA Settings */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Cài đặt LoRA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LoRA Target
                    </label>
                    <input
                      type="text"
                      name="loraTarget"
                      value={formData.loraTarget}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LoRA+ LR Ratio
                    </label>
                    <input
                      type="number"
                      name="loraplusLrRatio"
                      value={formData.loraplusLrRatio}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Training Parameters */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Tham số huấn luyện</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch Size
                    </label>
                    <input
                      type="number"
                      name="perDeviceTrainBatchSize"
                      value={formData.perDeviceTrainBatchSize}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gradient Accumulation Steps
                    </label>
                    <input
                      type="number"
                      name="gradientAccumulationSteps"
                      value={formData.gradientAccumulationSteps}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Learning Rate
                    </label>
                    <input
                      type="number"
                      name="learningRate"
                      value={formData.learningRate}
                      onChange={handleInputChange}
                      step="0.00001"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Epochs
                    </label>
                    <input
                      type="number"
                      name="numTrainEpochs"
                      value={formData.numTrainEpochs}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Samples
                    </label>
                    <input
                      type="number"
                      name="maxSamples"
                      value={formData.maxSamples}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warmup Ratio
                    </label>
                    <input
                      type="number"
                      name="warmupRatio"
                      value={formData.warmupRatio}
                      onChange={handleInputChange}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Cài đặt nâng cao</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LR Scheduler Type
                    </label>
                    <select
                      name="lrSchedulerType"
                      value={formData.lrSchedulerType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cosine">Cosine</option>
                      <option value="linear">Linear</option>
                      <option value="constant">Constant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Logging Steps
                    </label>
                    <input
                      type="number"
                      name="loggingSteps"
                      value={formData.loggingSteps}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Save Steps
                    </label>
                    <input
                      type="number"
                      name="saveSteps"
                      value={formData.saveSteps}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Gradient Norm
                    </label>
                    <input
                      type="number"
                      name="maxGradNorm"
                      value={formData.maxGradNorm}
                      onChange={handleInputChange}
                      step="0.1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Report To
                    </label>
                    <input
                      type="text"
                      name="reportTo"
                      value={formData.reportTo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="fp16"
                      checked={formData.fp16}
                      onChange={handleInputChange}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Enable FP16
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="border-t pt-6">
                <Button
                  type="submit"
                  disabled={isTraining}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isTraining ? (
                    <>
                      <IoTime className="animate-spin" size={20} />
                      <span>Đang huấn luyện...</span>
                    </>
                  ) : (
                    <>
                      <IoPlay size={20} />
                      <span>Bắt đầu Fine-tuning</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Files List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lịch sử huấn luyện ({trainingFiles.length})
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lĩnh vực
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kích thước
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trainingFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getStatusIcon(file.status)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {file.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {file.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getDomainBadge(file.domain)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(file.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(file.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(file.uploadedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                          title="Xem chi tiết"
                        >
                          <IoEye size={18} />
                        </button>
                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-full"
                          title="Tải xuống"
                        >
                          <IoDownload size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                          title="Xóa file"
                        >
                          <IoTrash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {trainingFiles.length === 0 && (
            <div className="text-center py-12">
              <IoDocument size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                Chưa có lịch sử huấn luyện nào
              </h3>
              <p className="text-gray-400">
                Bắt đầu bằng cách cấu hình và chạy fine-tuning đầu tiên
              </p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {trainingFiles.length}
            </div>
            <div className="text-sm text-gray-600">Tổng số lần huấn luyện</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {trainingFiles.filter(f => f.status === 'uploaded').length}
            </div>
            <div className="text-sm text-gray-600">Hoàn thành</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {trainingFiles.filter(f => f.status === 'processing').length}
            </div>
            <div className="text-sm text-gray-600">Đang xử lý</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {trainingFiles.filter(f => f.status === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">Thất bại</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffTrainingPage;
