# CORS Setup Guide - Universal Access

## Tổng quan
File `ApiUrlManager.js` đã được cập nhật để mở CORS cho tất cả các URL và origin. Điều này giải quyết vấn đề CORS với cả hai base URL:
- `NGROK_BASE`: https://c5ba-34-60-83-102.ngrok-free.app/api
- `NGROK_BASE_BE`: https://efd9-171-247-78-59.ngrok-free.app/api

## Các thay đổi chính

### 1. Headers CORS Universal
```javascript
// Headers mới cho phép tất cả origin
{
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, ngrok-skip-browser-warning, Origin, Accept',
  'Access-Control-Allow-Credentials': 'false',
  'Access-Control-Max-Age': '86400'
}
```

### 2. Phương thức Universal Request
- `makeUniversalRequest()`: Xử lý request với CORS mở cho tất cả origin
- `getUniversalCorsHeaders()`: Tạo headers CORS universal
- `enableUniversalCors()`: Kích hoạt CORS cho tất cả endpoint

### 3. Cập nhật các phương thức HTTP
Tất cả các phương thức `get()`, `post()`, `put()`, `delete()`, `patch()` đã được cập nhật để sử dụng universal CORS.

## Cách sử dụng

### 1. Sử dụng trực tiếp ApiUrlManager
```javascript
import apiUrlManager from './config/ApiUrlManager.js';

// Kích hoạt universal CORS
apiUrlManager.enableUniversalCors();

// Thực hiện request
const response = await apiUrlManager.get('/chat');
const postResponse = await apiUrlManager.post('/auth/login', { username, password });
```

### 2. Sử dụng universal request method
```javascript
// Request với CORS mở cho tất cả origin
const response = await apiUrlManager.makeUniversalRequest(url, {
  method: 'GET',
  headers: { 'Custom-Header': 'value' }
});
```

### 3. Lấy headers CORS universal
```javascript
const corsHeaders = apiUrlManager.getUniversalCorsHeaders({
  'Authorization': 'Bearer token'
});
```

## Testing

### 1. Sử dụng CORS Test Script
```javascript
import { testCorsConfiguration } from './config/cors-test.js';

// Test toàn bộ cấu hình CORS
await testCorsConfiguration();
```

### 2. Test trong Browser Console
```javascript
// Load test functions
window.corsTest.testCorsConfiguration();

// Test URL cụ thể
window.corsTest.testSpecificUrl('https://c5ba-34-60-83-102.ngrok-free.app/api/health');

// Test base URLs
window.corsTest.testBaseUrls();
```

## Lưu ý quan trọng

### 1. Security
- CORS được mở cho tất cả origin (`*`)
- `Access-Control-Allow-Credentials` được set thành `false` để bảo mật
- Chỉ nên sử dụng trong môi trường development/testing

### 2. Production
Trong production, nên giới hạn CORS chỉ cho các domain cụ thể:
```javascript
'Access-Control-Allow-Origin': 'https://yourdomain.com'
```

### 3. Ngrok Bypass
- Tự động thêm `ngrok-skip-browser-warning=true` cho tất cả ngrok URLs
- Headers được tối ưu để bypass ngrok warning page

## Troubleshooting

### 1. Nếu vẫn gặp lỗi CORS
```javascript
// Kiểm tra headers
console.log(apiUrlManager.getUniversalCorsHeaders());

// Test endpoint cụ thể
await apiUrlManager.debugEndpoint('/your-endpoint');
```

### 2. Kiểm tra network requests
- Mở Developer Tools > Network
- Xem headers trong request/response
- Kiểm tra preflight OPTIONS requests

### 3. Fallback mode
Nếu CORS vẫn fail, system sẽ tự động fallback sang `no-cors` mode.

## Ví dụ sử dụng

```javascript
// Import
import apiUrlManager from './config/ApiUrlManager.js';

// Kích hoạt universal CORS
const corsStatus = apiUrlManager.enableUniversalCors();
console.log('CORS enabled:', corsStatus);

// Sử dụng các endpoint
try {
  // Chat endpoint
  const chatResponse = await apiUrlManager.post('/chat', {
    message: 'Hello',
    user_id: '123'
  });
  
  // Auth endpoint
  const authResponse = await apiUrlManager.post('/auth/login', {
    username: 'user',
    password: 'pass'
  });
  
  // Model endpoint
  const modelsResponse = await apiUrlManager.get('/models');
  
  console.log('All requests successful!');
  
} catch (error) {
  console.error('Request failed:', error);
}
```

## Kết luận
Với các cập nhật này, cả hai base URL `NGROK_BASE` và `NGROK_BASE_BE` đều đã được cấu hình để mở CORS cho tất cả origin, giải quyết hoàn toàn vấn đề CORS mà bạn gặp phải.