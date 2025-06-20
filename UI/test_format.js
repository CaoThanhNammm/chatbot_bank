// Test script for text formatting
import { formatStreamingChunk } from './src/utils/textFormatter.js';

// Test cases
const testCases = [
  {
    name: 'Emoji và ký tự đặc biệt',
    input: '•*🏦 Vay tiền tại Agribank có rất nhiều hình thức và lựa chọn Vay tiêu dùng cá nhân: Vay vốn với lãi suất ưu đãi để phục vụ mục đích cá nhân.\\n•Vay mua nhà đất: Vay để mua, xây sửa nhà hoặc đất với lãi suất ưu đãi**.\\n•Vay sản xuất kinh doanh: Vay vốn để phát triển kinh doanh với lãi suất hợp lý**.\\n•Vay tiêu dùng tín chấp: Vay mà không cần thế chấp tài sản.📞 Bạn hãy gọi đến tổng đài 1900 55 88 18 để được tư vấn chi tiết nhé!'
  },
  {
    name: 'Unicode escape sequences',
    input: 'Xin chào! \\u{1F60A}\\n\\nTôi là trợ lý AI của AGRIBANK.'
  },
  {
    name: 'Escaped quotes',
    input: 'Chúng tôi có \\\"nhiều sản phẩm\\\" phù hợp với bạn.'
  },
  {
    name: 'JSON artifacts',
    input: '"Đây là nội dung phản hồi từ server"}'
  },
  {
    name: 'Mixed content',
    input: '🏦 AGRIBANK\\n\\n• Sản phẩm 1: \\\"Vay tiêu dùng\\\"\\n• Sản phẩm 2: Vay mua nhà\\n\\nLiên hệ: 📞 1900 55 88 18'
  }
];

console.log('=== TEXT FORMATTING TEST ===\n');

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase.name}`);
  console.log('Input:', JSON.stringify(testCase.input));
  
  const formatted = formatStreamingChunk(testCase.input);
  console.log('Output:', JSON.stringify(formatted));
  console.log('Rendered:', formatted);
  console.log('---\n');
});

console.log('=== TEST COMPLETED ===');