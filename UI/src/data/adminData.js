// Mock data for admin and staff functionality

export const mockUsers = [
  {
    id: 1,
    name: 'Nguyễn Văn Admin',
    email: 'admin@vietbank.com',
    role: 'admin',
    status: 'active',
    createdAt: new Date(2024, 0, 15),
    lastLogin: new Date(2024, 11, 1),
    department: 'IT'
  },
  {
    id: 2,
    name: 'Trần Thị Nhân Viên',
    email: 'staff@vietbank.com',
    role: 'staff',
    status: 'active',
    createdAt: new Date(2024, 2, 20),
    lastLogin: new Date(2024, 10, 30),
    department: 'Banking Services'
  },
  {
    id: 3,
    name: 'Lê Văn Khách Hàng',
    email: 'user@vietbank.com',
    role: 'user',
    status: 'active',
    createdAt: new Date(2024, 5, 10),
    lastLogin: new Date(2024, 10, 29),
    department: null
  },
  {
    id: 4,
    name: 'Phạm Thị Mai',
    email: 'mai.pham@vietbank.com',
    role: 'staff',
    status: 'inactive',
    createdAt: new Date(2024, 1, 5),
    lastLogin: new Date(2024, 9, 15),
    department: 'Customer Service'
  },
  {
    id: 5,
    name: 'Hoàng Văn Tùng',
    email: 'tung.hoang@vietbank.com',
    role: 'user',
    status: 'active',
    createdAt: new Date(2024, 7, 12),
    lastLogin: new Date(2024, 11, 1),
    department: null
  }
];

export const mockFineTuningModels = [
  {
    id: 1,
    name: 'VietBank Lending Model v2.1',
    domain: 'lending',
    status: 'active',
    accuracy: 94.5,
    trainingData: 'lending_data_2024.jsonl',
    createdAt: new Date(2024, 10, 15),
    updatedAt: new Date(2024, 10, 20),
    creator: 'Nguyễn Văn Admin',
    description: 'Mô hình AI chuyên biệt cho tư vấn vay vốn và thẻ tín dụng'
  },
  {
    id: 2,
    name: 'VietBank Investment Advisor v1.3',
    domain: 'investment',
    status: 'training',
    accuracy: 91.2,
    trainingData: 'investment_data_2024.jsonl',
    createdAt: new Date(2024, 9, 25),
    updatedAt: new Date(2024, 10, 18),
    creator: 'Trần Thị Nhân Viên',
    description: 'Mô hình tư vấn đầu tư và quản lý tài sản'
  },
  {
    id: 3,
    name: 'VietBank Customer Service v3.0',
    domain: 'customer_service',
    status: 'inactive',
    accuracy: 89.8,
    trainingData: 'customer_service_data.jsonl',
    createdAt: new Date(2024, 8, 10),
    updatedAt: new Date(2024, 9, 5),
    creator: 'Phạm Thị Mai',
    description: 'Mô hình hỗ trợ khách hàng và giải đáp thắc mắc'
  },
  {
    id: 4,
    name: 'VietBank Savings Consultant v1.0',
    domain: 'savings',
    status: 'pending',
    accuracy: null,
    trainingData: 'savings_data_2024.jsonl',
    createdAt: new Date(2024, 10, 25),
    updatedAt: new Date(2024, 10, 25),
    creator: 'Nguyễn Văn Admin',
    description: 'Mô hình tư vấn tiết kiệm và gửi tiền'
  }
];

export const mockTrainingFiles = [
  {
    id: 1,
    name: 'lending_data_2024.jsonl',
    domain: 'lending',
    size: 52.3, // MB
    status: 'uploaded',
    uploadedAt: new Date(2024, 10, 15),
    uploadedBy: 'Trần Thị Nhân Viên',
    description: 'Dữ liệu huấn luyện cho mô hình tư vấn vay vốn 2024'
  },
  {
    id: 2,
    name: 'investment_data_2024.jsonl',
    domain: 'investment',
    size: 48.7, // MB
    status: 'processing',
    uploadedAt: new Date(2024, 10, 18),
    uploadedBy: 'Nguyễn Văn Admin',
    description: 'Dữ liệu đầu tư và quản lý danh mục'
  },
  {
    id: 3,
    name: 'customer_service_qa.jsonl',
    domain: 'customer_service',
    size: 67.2, // MB
    status: 'failed',
    uploadedAt: new Date(2024, 10, 10),
    uploadedBy: 'Phạm Thị Mai',
    description: 'Bộ câu hỏi - đáp án dịch vụ khách hàng'
  },
  {
    id: 4,
    name: 'savings_consultation.jsonl',
    domain: 'savings',
    size: 31.5, // MB
    status: 'uploaded',
    uploadedAt: new Date(2024, 10, 20),
    uploadedBy: 'Trần Thị Nhân Viên',
    description: 'Dữ liệu tư vấn sản phẩm tiết kiệm'
  }
];

export const TRAINING_DOMAINS = [
  { value: 'lending', label: 'Cho vay & Tín dụng', color: 'blue' },
  { value: 'investment', label: 'Đầu tư & Quản lý tài sản', color: 'green' },
  { value: 'savings', label: 'Tiết kiệm & Gửi tiền', color: 'yellow' },
  { value: 'customer_service', label: 'Dịch vụ khách hàng', color: 'purple' },
  { value: 'insurance', label: 'Bảo hiểm', color: 'red' },
  { value: 'forex', label: 'Ngoại hối', color: 'indigo' },
  { value: 'banking_operations', label: 'Nghiệp vụ ngân hàng', color: 'gray' }
];

export const STATUS_COLORS = {
  active: 'green',
  inactive: 'gray', 
  training: 'blue',
  pending: 'yellow',
  failed: 'red',
  uploaded: 'green',
  processing: 'blue'
};
