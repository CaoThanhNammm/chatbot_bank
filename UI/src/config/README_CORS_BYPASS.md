# API URL Manager - CORS Bypass Guide

## Tổng quan

`ApiUrlManager` đã được cập nhật để tự động xử lý các vấn đề CORS khi làm việc với ngrok và localhost endpoints. Bạn không cần phải lo lắng về CORS errors nữa!

## Các tính năng mới

### 1. Headers được cải thiện
- Tự động thêm các headers cần thiết để bypass CORS
- Hỗ trợ cả ngrok và localhost endpoints
- Tự động detect origin từ browser

### 2. Convenience Methods (Khuyến nghị sử dụng)
```javascript
import apiUrlManager from './config/ApiUrlManager.js';

// GET request
const response = await apiUrlManager.get('/finetune');
const data = await response.json();

// POST request
const result = await apiUrlManager.post('/finetune', {
  model_name: 'my-model',
  training_data: 'data'
});

// PUT request
await apiUrlManager.put('/models/123', { name: 'Updated Model' });

// DELETE request
await apiUrlManager.delete('/models/123');
```

### 3. Automatic CORS Request Handler
```javascript
// Tự động xử lý CORS với fallback
const response = await apiUrlManager.makeCorsRequest(url, {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### 4. Enhanced Headers
```javascript
// Lấy headers với CORS bypass
const headers = apiUrlManager.getCorsHeaders('/finetune', {
  'Authorization': 'Bearer token'
});
```

## Cách sử dụng

### Phương pháp 1: Sử dụng Convenience Methods (Đơn giản nhất)

```javascript
import apiUrlManager from './config/ApiUrlManager.js';

// Thay vì:
// fetch(url, { method: 'GET', headers: {...} })

// Sử dụng:
const response = await apiUrlManager.get('/finetune');
```

### Phương pháp 2: Sử dụng makeCorsRequest

```javascript
const url = apiUrlManager.getFineTuningUrl();
const response = await apiUrlManager.makeCorsRequest(url, {
  method: 'POST',
  body: JSON.stringify(data)
});
```

### Phương pháp 3: Traditional fetch với enhanced headers

```javascript
const url = apiUrlManager.getChatUrl();
const headers = apiUrlManager.getCorsHeaders('/chat');

const response = await fetch(url, {
  method: 'POST',
  headers: headers,
  mode: 'cors',
  credentials: 'omit',
  body: JSON.stringify(data)
});
```

## Xử lý lỗi

```javascript
try {
  const response = await apiUrlManager.get('/finetune');
  if (response.ok) {
    const data = await response.json();
    console.log(data);
  }
} catch (error) {
  console.error('Request failed:', error);
  // Hệ thống sẽ tự động thử fallback methods
}
```

## Test CORS Connection

```javascript
import { testCorsConnection } from './config/ApiUsageExample.js';

// Test tất cả endpoints
const results = await testCorsConnection();
console.log(results);
```

## Cập nhật URLs động

```javascript
import { updateNgrokUrls } from './config/ApiUsageExample.js';

// Cập nhật khi có ngrok URL mới
updateNgrokUrls(
  'https://new-ngrok-url.ngrok-free.app',
  'https://new-localhost-url.ngrok-free.app'
);
```

## Các endpoints được hỗ trợ

### Ngrok Endpoints (AI/ML Services)
- `/load-model`
- `/chat`
- `/finetune`
- `/run_finetuning_task`
- `/start_finetuning`
- `/get_task_status`
- `/get_all_tasks`

### Localhost Endpoints (User Management)
- `/auth/*` - Authentication
- `/conversations/*` - Conversation management
- `/models/*` - Model management
- `/admin/*` - Admin functions
- `/system/*` - System status
- `/files/*` - File management

## Lưu ý quan trọng

1. **Tự động fallback**: Nếu request đầu tiên fail, hệ thống sẽ tự động thử với `no-cors` mode
2. **Headers tự động**: Không cần manually set CORS headers nữa
3. **Error handling**: Built-in error handling và retry logic
4. **Performance**: Thêm timestamp để tránh cache issues

## Migration từ code cũ

### Trước:
```javascript
const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true'
  },
  body: JSON.stringify(data)
});
```

### Sau:
```javascript
const response = await apiUrlManager.post('/endpoint', data);
```

Đơn giản hơn nhiều và không còn CORS errors! 🎉