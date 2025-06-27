import React, { useState, useEffect, useRef } from 'react';
import { IoCloudUpload, IoDocument, IoCheckmarkCircle, IoCloseCircle, IoTime, IoTrash, IoDownload, IoEye, IoWarning, IoPlay, IoSettings, IoInformationCircle, IoCloudDownload, IoStop } from 'react-icons/io5';
import { ChatHeader } from '../components';
import { Button } from '../components';
import { mockTrainingFiles, TRAINING_DOMAINS, STATUS_COLORS } from '../data/adminData';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import apiUrlManager from '../config/ApiUrlManager';

// Tooltip component
const Tooltip = ({ children, text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg -top-2 -translate-y-full left-1/2 -translate-x-1/2 whitespace-nowrap">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
      )}
    </div>
  );
};

const StaffTrainingPage = () => {
  // Fine-tuning form state with proper data types
  const [formData, setFormData] = useState({
    datasetFile: null,
    stage: 'sft',
    doTrain: true,
    modelNameOrPath: 'unsloth/llama-3-8b-Instruct-bnb-4bit',
    template: 'llama3',
    outputDir: 'llama3_lora',
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
  const [fineTuningTasks, setFineTuningTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingError, setTrainingError] = useState('');
  const [trainingResult, setTrainingResult] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loadingModelUnload, setLoadingModelUnload] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  // Redirect if user is not admin
  useEffect(() => {
    if (!user || !user.is_admin) {
      window.location.href = '/chat';
    }
  }, [user]);

  // Fetch fine-tuning tasks from API
  const fetchFineTuningTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const response = await axios.get(apiUrlManager.getFineTuningTasksUrl(), {
        headers: apiUrlManager.getNgrokHeaders()
      });

      if (response.data.success) {
        setFineTuningTasks(response.data.tasks || []);
      } else {
        console.error('Failed to fetch tasks:', response.data);
      }
    } catch (error) {
      console.error('Error fetching fine-tuning tasks:', error);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  // Load tasks on component mount
  useEffect(() => {
    if (user && user.is_admin) {
      fetchFineTuningTasks();
    }
  }, [user]);

  // Handle load model
  const handleLoadModel = async (task) => {
    try {
      // Chỉ load model nếu task đã completed
      if (task.status !== 'completed') {
        alert('Chỉ có thể load model từ task đã hoàn thành');
        return;
      }

      const modelName = task.args?.output_dir;
      if (!modelName) {
        alert('Không tìm thấy thông tin model');
        return;
      }

      // Hiển thị loading
      const loadingMessage = `Đang load model ${modelName}...`;
      console.log(loadingMessage);

      // Call API load-model
      const response = await axios.post(apiUrlManager.getLoadModelUrl(), {
        model: modelName
      }, {
        headers: apiUrlManager.getNgrokHeaders()
      });

      if (response.data.success) {
        alert(`Model ${modelName} đã được load thành công!`);
        console.log('Model loaded successfully:', response.data);
      } else {
        alert(`Lỗi khi load model: ${response.data.message}`);
        console.error('Load model failed:', response.data);
      }
    } catch (error) {
      console.error('Error loading model:', error);
      if (error.response) {
        alert(`Lỗi server: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
        alert('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      } else {
        alert(`Lỗi: ${error.message}`);
      }
    }
  };

  // Handle unload model
  const handleUnloadModel = async () => {
    setLoadingModelUnload(true);
    
    try {
      const response = await axios.post(apiUrlManager.getUnloadModelUrl(), {}, {
        headers: apiUrlManager.getNgrokHeaders()
      });

      if (response.data.success) {
        setSuccessMessage('Unload mô hình thành công! GPU memory đã được giải phóng.');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setTrainingError(`Lỗi unload mô hình: ${response.data.message || 'Unknown error'}`);
        setTimeout(() => setTrainingError(''), 5000);
      }
    } catch (error) {
      console.error('Error unloading model:', error);
      if (error.response) {
        setTrainingError(`Lỗi server: ${error.response.data?.message || error.response.status}`);
      } else if (error.request) {
        setTrainingError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      } else {
        setTrainingError(`Lỗi: ${error.message}`);
      }
      setTimeout(() => setTrainingError(''), 5000);
    } finally {
      setLoadingModelUnload(false);
    }
  };

  // Handle form input changes with proper type conversion
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue;
    
    if (type === 'checkbox') {
      processedValue = checked;
    } else if (type === 'number') {
      // Convert string to number for numeric inputs
      if (value === '' || value === null) {
        processedValue = 0;
      } else {
        // Handle different numeric types
        if (name === 'learningRate' || name === 'warmupRatio' || name === 'numTrainEpochs' || name === 'maxGradNorm' || name === 'loraplusLrRatio') {
          processedValue = parseFloat(value);
        } else {
          processedValue = parseInt(value, 10);
        }
        
        // Validate the number
        if (isNaN(processedValue)) {
          processedValue = 0;
        }
      }
    } else {
      processedValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
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
      setTrainingError('Vui lòng chọn file JSON để huấn luyện');
      return;
    }

    setIsTraining(true);
    setTrainingProgress(0);
    setTrainingError('');
    setTrainingResult(null);

    try {
      // Read file content as JSON
      let datasetContent = null;
      if (formData.datasetFile) {
        const fileText = await formData.datasetFile.text();
        try {
          datasetContent = JSON.parse(fileText);
        } catch (parseError) {
          setTrainingError('File JSON không hợp lệ. Vui lòng kiểm tra định dạng file.');
          return;
        }
      }

      // Validate numeric parameters before sending with specific ranges for LLaMA-Factory
      const validateNumericParam = (value, defaultValue, min = 0, max = null) => {
        const num = Number(value);
        if (isNaN(num) || num < min || (max !== null && num > max)) {
          console.warn(`Parameter value ${value} is invalid, using default ${defaultValue}`);
          return defaultValue;
        }
        return num;
      };

      // Backend-specific parameter validation and correction
      const validateBackendCompatibility = (params) => {
        // Fix save_steps default mismatch (UI: 100, Backend: 1000)
        if (params.save_steps === 100) {
          params.save_steps = 1000; // Match backend default
          console.log('Adjusted save_steps to match backend default: 1000');
        }

        // Fix learning_rate format (Backend expects 5e-5, not 0.00005)
        if (params.learning_rate === 0.00005) {
          params.learning_rate = 5e-5; // Use scientific notation
          console.log('Adjusted learning_rate to scientific notation: 5e-5');
        }

        // Ensure output_dir doesn't have conflicting path separators
        if (params.output_dir && params.output_dir.includes('\\')) {
          params.output_dir = params.output_dir.replace(/\\/g, '/');
          console.log('Fixed output_dir path separators');
        }

        // Validate lr_scheduler_type values
        const validSchedulers = ['cosine', 'linear', 'constant', 'polynomial', 'cosine_with_restarts'];
        if (!validSchedulers.includes(params.lr_scheduler_type)) {
          params.lr_scheduler_type = 'cosine';
          console.warn('Invalid lr_scheduler_type, using default: cosine');
        }

        // Validate template values for LLaMA-3
        const validTemplates = ['llama3', 'llama2', 'alpaca', 'vicuna', 'chatglm3'];
        if (!validTemplates.includes(params.template)) {
          params.template = 'llama3';
          console.warn('Invalid template, using default: llama3');
        }

        // Validate finetuning_type
        const validFinetuningTypes = ['lora', 'qlora', 'full'];
        if (!validFinetuningTypes.includes(params.finetuning_type)) {
          params.finetuning_type = 'lora';
          console.warn('Invalid finetuning_type, using default: lora');
        }

        // Ensure batch size and gradient accumulation don't cause memory issues
        const effectiveBatchSize = params.per_device_train_batch_size * params.gradient_accumulation_steps;
        if (effectiveBatchSize > 32) {
          console.warn(`Effective batch size (${effectiveBatchSize}) is very high, may cause memory issues`);
        }

        // Validate epoch and steps relationship
        if (params.save_steps > (params.max_samples / params.per_device_train_batch_size)) {
          console.warn('save_steps is larger than total training steps, model may not save checkpoints');
        }

        return params;
      };

      // Create JSON payload for API request with proper type conversion and validation
      let requestData = {
        stage: String(formData.stage),
        do_train: Boolean(formData.doTrain),
        model_name_or_path: String(formData.modelNameOrPath),
        dataset: datasetContent,
        template: String(formData.template),
        finetuning_type: String(formData.finetuningType),
        lora_target: String(formData.loraTarget),
        output_dir: String(formData.outputDir),
        per_device_train_batch_size: validateNumericParam(formData.perDeviceTrainBatchSize, 2, 1, 32),
        gradient_accumulation_steps: validateNumericParam(formData.gradientAccumulationSteps, 4, 1, 128),
        lr_scheduler_type: String(formData.lrSchedulerType),
        logging_steps: validateNumericParam(formData.loggingSteps, 5, 1, 1000),
        warmup_ratio: validateNumericParam(formData.warmupRatio, 0.1, 0, 1.0),
        save_steps: validateNumericParam(formData.saveSteps, 100, 1, 10000),
        learning_rate: validateNumericParam(formData.learningRate, 0.00005, 0.000001, 0.01),
        num_train_epochs: validateNumericParam(formData.numTrainEpochs, 3.0, 0.1, 100),
        max_samples: validateNumericParam(formData.maxSamples, 500, 1, 100000),
        max_grad_norm: validateNumericParam(formData.maxGradNorm, 1.0, 0.1, 10.0),
        loraplus_lr_ratio: validateNumericParam(formData.loraplusLrRatio, 16.0, 1.0, 100.0),
        fp16: Boolean(formData.fp16),
        report_to: String(formData.reportTo)
      };

      // Apply backend-specific compatibility fixes
      requestData = validateBackendCompatibility(requestData);

      // Log the original form data and processed request data for debugging
      console.log('Original form data:', formData);
      console.log('Processed request data being sent to API:', requestData);
      
      // Validate that all numeric parameters are actually numbers
      const numericParams = [
        'per_device_train_batch_size', 'gradient_accumulation_steps', 'logging_steps',
        'save_steps', 'max_samples', 'learning_rate', 'num_train_epochs',
        'warmup_ratio', 'max_grad_norm', 'loraplus_lr_ratio'
      ];
      
      numericParams.forEach(param => {
        if (typeof requestData[param] !== 'number' || isNaN(requestData[param])) {
          console.error(`Parameter ${param} is not a valid number:`, requestData[param]);
        }
      });

      // Additional validation for LLaMA-Factory specific requirements
      if (requestData.learning_rate <= 0) {
        console.error('Learning rate must be positive');
        setTrainingError('Learning rate phải lớn hơn 0');
        return;
      }

      if (requestData.num_train_epochs <= 0) {
        console.error('Number of epochs must be positive');
        setTrainingError('Số epochs phải lớn hơn 0');
        return;
      }

      if (requestData.per_device_train_batch_size <= 0) {
        console.error('Batch size must be positive');
        setTrainingError('Batch size phải lớn hơn 0');
        return;
      }

      // Warn about potentially problematic combinations
      if (requestData.learning_rate > 0.001) {
        console.warn('Learning rate is quite high, this might cause training instability');
      }

      if (requestData.per_device_train_batch_size > 8 && requestData.gradient_accumulation_steps > 8) {
        console.warn('High batch size and gradient accumulation might cause memory issues');
      }

      // Additional LLaMA-Factory specific validations
      
      // Validate LoRA target format
      if (requestData.lora_target && requestData.lora_target !== 'all') {
        // Ensure lora_target is properly formatted for LLaMA-Factory
        const validLoraTargets = ['all', 'q_proj', 'v_proj', 'k_proj', 'o_proj', 'gate_proj', 'up_proj', 'down_proj'];
        const targets = requestData.lora_target.split(',').map(t => t.trim());
        const invalidTargets = targets.filter(t => !validLoraTargets.includes(t));
        
        if (invalidTargets.length > 0) {
          console.warn(`Invalid LoRA targets found: ${invalidTargets.join(', ')}, using 'all'`);
          requestData.lora_target = 'all';
        }
      }

      // Validate model path format
      if (requestData.model_name_or_path && !requestData.model_name_or_path.includes('/')) {
        console.warn('Model path might be invalid, ensure it follows HuggingFace format (e.g., username/model-name)');
      }

      // Ensure dataset is properly formatted
      if (!requestData.dataset || (Array.isArray(requestData.dataset) && requestData.dataset.length === 0)) {
        setTrainingError('Dataset không hợp lệ hoặc rỗng');
        return;
      }

      // Validate dataset format for LLaMA-Factory
      if (Array.isArray(requestData.dataset)) {
        const requiredFields = ['instruction', 'input', 'output'];
        const sampleItem = requestData.dataset[0];
        
        if (!sampleItem || !requiredFields.every(field => field in sampleItem)) {
          console.warn('Dataset format might not be compatible with LLaMA-Factory');
          console.log('Expected fields:', requiredFields);
          console.log('Sample item fields:', sampleItem ? Object.keys(sampleItem) : 'No sample item');
        }
      }

      // Final parameter conflict resolution
      const resolveParameterConflicts = (params) => {
        // Fix common parameter conflicts that cause LLaMA-Factory to fail
        
        // If save_steps is too large compared to total steps, adjust it
        const estimatedTotalSteps = Math.ceil(params.max_samples / params.per_device_train_batch_size) * params.num_train_epochs;
        if (params.save_steps > estimatedTotalSteps) {
          params.save_steps = Math.max(Math.floor(estimatedTotalSteps / 4), 100);
          console.log(`Adjusted save_steps to ${params.save_steps} based on estimated total steps: ${estimatedTotalSteps}`);
        }

        // Ensure logging_steps is not larger than save_steps
        if (params.logging_steps > params.save_steps) {
          params.logging_steps = Math.min(params.save_steps, 10);
          console.log(`Adjusted logging_steps to ${params.logging_steps} to be <= save_steps`);
        }

        // For very small datasets, adjust parameters
        if (params.max_samples < 100) {
          if (params.save_steps > 50) {
            params.save_steps = 50;
            console.log('Adjusted save_steps for small dataset');
          }
          if (params.num_train_epochs > 5) {
            params.num_train_epochs = 5;
            console.log('Adjusted num_train_epochs for small dataset');
          }
        }

        // Ensure warmup_ratio makes sense with the number of steps
        if (params.warmup_ratio > 0.5) {
          params.warmup_ratio = 0.1;
          console.log('Adjusted warmup_ratio to prevent excessive warmup');
        }

        return params;
      };

      // Apply final conflict resolution
      requestData = resolveParameterConflicts(requestData);

      // Final validation before sending
      const finalValidation = (data) => {
        const errors = [];
        
        // Check required fields
        if (!data.model_name_or_path) errors.push('Model name is required');
        if (!data.dataset) errors.push('Dataset is required');
        if (!data.output_dir) errors.push('Output directory is required');
        
        // Check numeric fields are actually numbers
        const numericFields = [
          'per_device_train_batch_size', 'gradient_accumulation_steps', 
          'logging_steps', 'save_steps', 'learning_rate', 'num_train_epochs',
          'max_samples', 'warmup_ratio', 'max_grad_norm', 'loraplus_lr_ratio'
        ];
        
        numericFields.forEach(field => {
          if (typeof data[field] !== 'number' || isNaN(data[field])) {
            errors.push(`${field} must be a valid number`);
          }
        });
        
        // Check boolean fields
        if (typeof data.do_train !== 'boolean') errors.push('do_train must be boolean');
        if (typeof data.fp16 !== 'boolean') errors.push('fp16 must be boolean');
        
        return errors;
      };

      const validationErrors = finalValidation(requestData);
      if (validationErrors.length > 0) {
        console.error('Validation errors:', validationErrors);
        setTrainingError(`Lỗi validation: ${validationErrors.join(', ')}`);
        return;
      }

      // Show initial progress while sending request
      setTrainingProgress(10);

      // Call to ngrok API endpoint using axios with enhanced error handling
      const response = await axios.post(apiUrlManager.getFineTuningUrl(), requestData, {
        headers: apiUrlManager.getNgrokHeaders(),
        timeout: 30000, // 30 second timeout for initial request
        validateStatus: function (status) {
          // Accept both success and error status codes to handle them properly
          return status >= 200 && status < 600;
        }
      });

      const result = response.data;
      console.log('Fine-tuning API response:', result);
      console.log('Response status:', response.status);
      
      // Handle different response status codes
      if (response.status >= 400) {
        console.error('Server returned error status:', response.status);
        const errorMessage = result.message || result.error || `Server error: ${response.status}`;
        setTrainingError(`Lỗi server (${response.status}): ${errorMessage}`);
        setIsTraining(false);
        setTrainingProgress(0);
        return;
      }
      
      setTrainingProgress(100);
      setIsTraining(false);
      setTrainingResult(result);
      
      // Enhanced response validation
      const isSuccess = result.success === true || 
                       (Array.isArray(result) && result[0] === true) ||
                       (result.task_id && result.message);
      
      if (isSuccess) {
        const taskId = result.task_id || (Array.isArray(result) ? result[2] : null);
        const message = result.message || (Array.isArray(result) ? result[1] : 'Task started successfully');
        
        if (!taskId) {
          console.error('No task ID received from server');
          setTrainingError('Server không trả về task ID. Vui lòng kiểm tra server logs.');
          return;
        }
        
        setSuccessMessage(`Huấn luyện mô hình đã bắt đầu thành công! ${message}`);
        
        // Add to training files list
        const newFile = {
          id: Date.now(),
          name: formData.datasetFile.name,
          domain: 'fine_tuning',
          size: (formData.datasetFile.size / (1024 * 1024)).toFixed(1),
          status: 'processing',
          uploadedAt: new Date(),
          uploadedBy: 'Current User',
          description: `Fine-tuning với ${formData.modelNameOrPath}`,
          taskId: taskId
        };
        setTrainingFiles(prev => [newFile, ...prev]);
        
        // Refresh the tasks list to show the new task
        setTimeout(() => {
          fetchFineTuningTasks();
        }, 1000);
      } else {
        const errorMessage = result.message || 
                           (Array.isArray(result) ? result[1] : null) || 
                           result.error ||
                           'Có lỗi xảy ra trong quá trình khởi tạo huấn luyện';
        console.error('Training failed:', errorMessage);
        setTrainingError(errorMessage);
      }
    } catch (error) {
      console.error('Training error:', error);
      setIsTraining(false);
      setTrainingProgress(0);
      
      // Handle axios error with detailed message
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${error.response.status}`;
        console.error('Server error response:', error.response.data);
        setTrainingError(`Lỗi server: ${errorMessage}`);
      } else if (error.request) {
        // Request was made but no response received
        setTrainingError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      } else {
        // Something else happened
        setTrainingError(`Lỗi: ${error.message}`);
      }
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
    if (!date) return 'N/A';
    
    let dateObj;
    if (typeof date === 'string') {
      // Nếu chuỗi thời gian không có timezone info, coi như là UTC
      if (date.includes('T') && !date.includes('Z') && !date.includes('+') && !date.includes('-', 10)) {
        // Thêm 'Z' để đánh dấu là UTC
        dateObj = new Date(date + 'Z');
      } else {
        dateObj = new Date(date);
      }
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return 'N/A';
    }
    
    // Kiểm tra nếu date không hợp lệ
    if (isNaN(dateObj.getTime())) {
      return 'N/A';
    }
    
    // Chuyển đổi từ UTC sang giờ Việt Nam (UTC+7)
    const vietnamTime = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000));
    
    // Format thủ công để đảm bảo định dạng chính xác
    const year = vietnamTime.getUTCFullYear();
    const month = String(vietnamTime.getUTCMonth() + 1).padStart(2, '0');
    const day = String(vietnamTime.getUTCDate()).padStart(2, '0');
    const hours = String(vietnamTime.getUTCHours()).padStart(2, '0');
    const minutes = String(vietnamTime.getUTCMinutes()).padStart(2, '0');
    const seconds = String(vietnamTime.getUTCSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  const getTaskStatusBadge = (status) => {
    const statusMap = {
      running: { text: 'Đang chạy', color: 'bg-blue-100 text-blue-800' },
      completed: { text: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
      failed: { text: 'Thất bại', color: 'bg-red-100 text-red-800' },
      pending: { text: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800' }
    };

    const statusInfo = statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
        {statusInfo.text}
      </span>
    );
  };

  const getTaskStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <IoCheckmarkCircle className="text-green-600" size={20} />;
      case 'running':
        return <IoTime className="text-blue-600" size={20} />;
      case 'failed':
        return <IoCloseCircle className="text-red-500" size={20} />;
      case 'pending':
        return <IoTime className="text-yellow-600" size={20} />;
      default:
        return <IoDocument className="text-gray-500" size={20} />;
    }
  };
  const getStatusBadge = (status) => {
    const statusMap = {
      uploaded: { text: 'Đã tải lên', color: 'bg-red-100 text-red-800' },
      processing: { text: 'Đang xử lý', color: 'bg-red-100 text-red-800' },
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
      blue: 'bg-red-100 text-red-800',
      green: 'bg-red-100 text-red-800',
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
        return <IoCheckmarkCircle className="text-red-600" size={20} />;
      case 'processing':
        return <IoTime className="text-red-600" size={20} />;
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
            Fine-tuning Model với JSON Upload
          </h1>
          <p className="text-gray-600">
            Huấn luyện mô hình AI với dữ liệu tùy chỉnh
          </p>
        </div>

        {/* Fine-tuning Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6">
            <div className="flex items-center mb-4">
              <IoSettings className="text-red-600 mr-2" size={24} />
              <h2 className="text-lg font-semibold text-gray-900">
                Cấu hình Fine-tuning
              </h2>
            </div>
            
            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">                  <IoCheckmarkCircle className="text-red-600 mr-2" size={20} />
                  <span className="text-red-800">{successMessage}</span>
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
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center mb-2">                  <IoPlay className="text-red-600 mr-2" size={20} />
                  <span className="text-red-800 font-medium">Đang khởi tạo fine-tuning... {Math.round(trainingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-300"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    JSON File *
                    <Tooltip text="File JSON chứa dữ liệu huấn luyện theo định dạng chuẩn">
                      <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                    </Tooltip>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                  {formData.datasetFile && (
                    <p className="mt-1 text-sm text-green-600">
                      File đã chọn: {formData.datasetFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Model Name hoặc Path *
                    <Tooltip text="Chọn mô hình cơ sở để fine-tuning">
                      <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                    </Tooltip>
                  </label>
                  <select
                    name="modelNameOrPath"
                    value={formData.modelNameOrPath}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  >
                    <option value="unsloth/llama-3-8b-Instruct-bnb-4bit">unsloth/llama-3-8b-Instruct-bnb-4bit</option>
                  </select>
                </div>
              </div>

              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Stage
                    <Tooltip text="Giai đoạn huấn luyện (sft = supervised fine-tuning)">
                      <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    name="stage"
                    value={formData.stage}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Template
                    <Tooltip text="Template định dạng tin nhắn cho mô hình (mặc định: llama3)">
                      <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    name="template"
                    value={formData.template}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Output Directory
                    <Tooltip text="Thư mục lưu kết quả fine-tuning">
                      <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                    </Tooltip>
                  </label>
                  <input
                    type="text"
                    name="outputDir"
                    value={formData.outputDir}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                    Fine-tuning Type
                    <Tooltip text="Phương pháp fine-tuning: LoRA (hiệu quả), Full (toàn bộ), QLoRA (tiết kiệm bộ nhớ)">
                      <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                    </Tooltip>
                  </label>
                  <select
                    name="finetuningType"
                    value={formData.finetuningType}
                    onChange={handleInputChange}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                  >
                    <option value="lora">LoRA</option>
                    <option value="full">Full Fine-tuning</option>
                    <option value="qlora">QLoRA</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="doTrain"
                    checked={formData.doTrain}
                    onChange={handleInputChange}
                    disabled
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700 flex items-center">
                    Do Train
                    <Tooltip text="Bật/tắt chế độ huấn luyện (mặc định: true)">
                      <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                    </Tooltip>
                  </label>
                </div>
              </div>

              {/* LoRA Settings */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Cài đặt LoRA</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      LoRA Target
                      <Tooltip text="Các layer áp dụng LoRA (all = tất cả layer)">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="text"
                      name="loraTarget"
                      value={formData.loraTarget}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      LoRA+ LR Ratio
                      <Tooltip text="Tỷ lệ learning rate cho LoRA+ (thường 16.0)">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="loraplusLrRatio"
                      value={formData.loraplusLrRatio}
                      onChange={handleInputChange}
                      step="0.1"
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Training Parameters */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Tham số huấn luyện</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Batch Size
                      <Tooltip text="Số mẫu xử lý cùng lúc trên mỗi GPU">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="perDeviceTrainBatchSize"
                      value={formData.perDeviceTrainBatchSize}
                      onChange={handleInputChange}
                      min="1"
                      max="32"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Gradient Accumulation Steps
                      <Tooltip text="Số bước tích lũy gradient trước khi cập nhật">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="gradientAccumulationSteps"
                      value={formData.gradientAccumulationSteps}
                      onChange={handleInputChange}
                      min="1"
                      max="128"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Learning Rate
                      <Tooltip text="Tốc độ học của mô hình (thường 0.00005)">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="learningRate"
                      value={formData.learningRate}
                      onChange={handleInputChange}
                      step="0.00001"
                      min="0.000001"
                      max="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Number of Epochs
                      <Tooltip text="Số lần duyệt qua toàn bộ dataset">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="numTrainEpochs"
                      value={formData.numTrainEpochs}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0.1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Max Samples
                      <Tooltip text="Số mẫu tối đa sử dụng để huấn luyện">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="maxSamples"
                      value={formData.maxSamples}
                      onChange={handleInputChange}
                      min="1"
                      max="100000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Warmup Ratio
                      <Tooltip text="Tỷ lệ bước warmup so với tổng số bước">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="warmupRatio"
                      value={formData.warmupRatio}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      max="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="border-t pt-6">
                <h3 className="text-md font-medium text-gray-900 mb-4">Cài đặt nâng cao</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      LR Scheduler Type
                      <Tooltip text="Kiểu điều chỉnh learning rate: Cosine (giảm dần), Linear (tuyến tính), Constant (cố định)">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <select
                      name="lrSchedulerType"
                      value={formData.lrSchedulerType}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    >
                      <option value="cosine">Cosine</option>
                      <option value="linear">Linear</option>
                      <option value="constant">Constant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Logging Steps
                      <Tooltip text="Số bước giữa các lần ghi log">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="loggingSteps"
                      value={formData.loggingSteps}
                      onChange={handleInputChange}
                      min="1"
                      max="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Save Steps
                      <Tooltip text="Số bước giữa các lần lưu checkpoint">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="saveSteps"
                      value={formData.saveSteps}
                      onChange={handleInputChange}
                      min="1"
                      max="10000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Max Gradient Norm
                      <Tooltip text="Giá trị tối đa để cắt gradient (tránh exploding gradient)">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="number"
                      name="maxGradNorm"
                      value={formData.maxGradNorm}
                      onChange={handleInputChange}
                      step="0.1"
                      min="0.1"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Report To
                      <Tooltip text="Nơi gửi báo cáo huấn luyện (none = không gửi)">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
                    </label>
                    <input
                      type="text"
                      name="reportTo"
                      value={formData.reportTo}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      Enable FP16
                      <Tooltip text="Sử dụng độ chính xác 16-bit để tiết kiệm bộ nhớ">
                        <IoInformationCircle className="ml-1 text-gray-400 hover:text-gray-600 cursor-help" size={16} />
                      </Tooltip>
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
                      <span>Đang khởi tạo...</span>
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

        {/* Fine-tuning Tasks Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <IoDocument className="text-red-600 mr-2" size={24} />
                <h2 className="text-lg font-semibold text-gray-900">
                  Danh sách Fine-tuning Tasks
                </h2>
              </div>
              <Button
                onClick={fetchFineTuningTasks}
                disabled={isLoadingTasks}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoadingTasks ? (
                  <>
                    <IoTime className="animate-spin" size={16} />
                    <span>Đang tải...</span>
                  </>
                ) : (
                  <>
                    <IoDownload size={16} />
                    <span>Làm mới</span>
                  </>
                )}
              </Button>
            </div>

            {/* Tasks Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Task ID</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Model</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Started</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Completed</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {fineTuningTasks.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-8 text-gray-500">
                        {isLoadingTasks ? 'Đang tải dữ liệu...' : 'Chưa có task nào'}
                      </td>
                    </tr>
                  ) : (
                    fineTuningTasks.map((task, index) => (
                      <tr key={task.id || index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            {getTaskStatusIcon(task.status)}
                            <span className="ml-2 text-sm font-medium text-gray-900">
                              {task.id ? task.id.substring(0, 8) + '...' : `Task ${index + 1}`}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {task.args?.model_name_or_path || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {task.args?.finetuning_type || 'N/A'} • {task.args?.stage || 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          {getTaskStatusBadge(task.status)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {task.created_at ? formatDate(task.created_at) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {task.started_at ? formatDate(task.started_at) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {task.completed_at ? formatDate(task.completed_at) : 'N/A'}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Tooltip text={task.status === 'completed' ? 'Load Model' : 'Chỉ có thể load model đã hoàn thành'}>
                              <button
                                onClick={() => handleLoadModel(task)}
                                disabled={task.status !== 'completed'}
                                className={`p-1 transition-colors ${
                                  task.status === 'completed' 
                                    ? 'text-gray-400 hover:text-blue-600 cursor-pointer' 
                                    : 'text-gray-300 cursor-not-allowed'
                                }`}
                              >
                                <IoCloudDownload size={16} />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Task Details */}
            {fineTuningTasks.length > 0 && (
              <div className="mt-6 text-sm text-gray-600">
                <p>Tổng số tasks: {fineTuningTasks.length}</p>
                <p>
                  Running: {fineTuningTasks.filter(t => t.status === 'running').length} • 
                  Completed: {fineTuningTasks.filter(t => t.status === 'completed').length} • 
                  Failed: {fineTuningTasks.filter(t => t.status === 'failed').length}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffTrainingPage;
