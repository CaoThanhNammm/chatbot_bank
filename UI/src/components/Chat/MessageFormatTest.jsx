import React from 'react';
import MessageBubble from './MessageBubble';

const MessageFormatTest = () => {
  // Test message with the format issues mentioned
  const testMessage = `*Có rất nhiều lý do khiến bạn cần vay vốn cho kinh doanh. 🚀👉 Chủ động tài trợ vốn: Vay vốn từ ngân hàng sẽ giúp bạn chủ động hơn trong việc chi tiêu, đầu tư và phát triển kinh doanh.👉 Hỗ trợ phát triển kinh tế: Việc vay vốn để kinh doanh sẽ đóng góp vào sự phát triển kinh tế của cả nước.👉 Tài chính ổn định: Vay vốn sẽ giúp bạn có một ngân quỹ ổn định để chi tiêu, giảm bớt áp lực tài chính.👉 Dịch vụ hỗ trợ: Các ngân hàng đều có các chương trình, dịch vụ hỗ trợ người vay như: hỗ trợ tài chính, đào tạo kinh doanh, v.v.Để được duyệt vay, bạn cần chuẩn bị những gì?👉 📄 Hồ sơ pháp lý: Chứng minh nhân dân (CMND) hoặc Căn cước công dân (CCCD).👉 📑 Hồ sơ kinh doanh: Giấy đăng ký kinh doanh (GDKK), Giấy phép kinh doanh (GPKK) hoặc Giấy phép thành lập và hoạt động (GPTA) của doanh nghiệp.👉 📈 Kế hoạch kinh doanh:** Kế hoạch kinh doanh chi tiết, bao gồm mục tiêu, kế hoạch tài chính và phương án huy động vốn.`;

  const testMessage2 = `**Chào bạn!** Tôi là trợ lý AI của AGRIBANK.

*Dưới đây là các dịch vụ chúng tôi cung cấp:*

* Vay vốn kinh doanh
* Tiết kiệm có kỳ hạn  
* Chuyển khoản nhanh
* Tư vấn đầu tư

👉 **Lưu ý quan trọng:** Vui lòng chuẩn bị đầy đủ giấy tờ.

Bạn cần hỗ trợ gì khác không?`;

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Message Format Test</h1>
      
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test Case 1: Original Problem Message</h2>
        <div className="bg-white p-4 rounded-lg">
          <MessageBubble
            message={testMessage}
            isBot={true}
            timestamp={new Date()}
            isStreaming={false}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test Case 2: Mixed Format Message</h2>
        <div className="bg-white p-4 rounded-lg">
          <MessageBubble
            message={testMessage2}
            isBot={true}
            timestamp={new Date()}
            isStreaming={false}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Test Case 3: Streaming Message</h2>
        <div className="bg-white p-4 rounded-lg">
          <MessageBubble
            message={testMessage2}
            isBot={true}
            timestamp={new Date()}
            isStreaming={true}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageFormatTest;