import React, { useState } from 'react';
import MessageBubble from '../components/Chat/MessageBubble';

/**
 * Test page for message formatting functionality
 */
const MessageFormattingTestPage = () => {
  const [testMessage, setTestMessage] = useState(`Để vay ngân hàng, bạn cần chuẩn bị một số giấy tờ cơ bản sau:

* Chứng minh nhân dân (CMND) hoặc Căn cước công dân (CCCD): Đây là giấy tờ bắt buộc phải có.

* Hồ sơ vay vốn: Phụ thuộc vào loại vay và mục đích vay mà bạn cần chuẩn bị:
  + Vay tín chấp (vay tiêu dùng): Giấy đề nghị vay vốn, hợp đồng tín dụng, giấy tờ chứng minh thu nhập (hợp đồng lao động, sao kê lương, giấy tờ kinh doanh...).
  + Vay mua nhà đất: Giấy đề nghị vay vốn, hợp đồng tín dụng, giấy đăng ký quyền sử dụng đất, hợp đồng mua bán nhà đất.
  + Vay sản xuất kinh doanh: Giấy đề nghị vay vốn, hợp đồng tín dụng, giấy phép kinh doanh, giấy đăng ký kinh doanh...

* Chứng minh thu nhập: Bạn cần có thu nhập ổn định và đáng kể để chứng minh khả năng trả nợ. Các giấy tờ chứng minh thu nhập thường bao gồm:
  + Sao kê lương.
  + Hợp đồng lao động.
  + Giấy tờ kinh doanh (sổ đăng ký kinh doanh, giấy phép kinh doanh...).

* Chứng minh mục đích vay: Bạn cần có mục đích vay rõ ràng và hợp pháp. Ví dụ: mua nhà, mua xe, sản xuất kinh doanh...

* Tài sản đảm bảo (nếu có): Bạn có thể sử dụng tài sản như sổ tiết kiệm, bất động sản, xe cộ... để đảm bảo cho vay.

Sau khi chuẩn bị đầy đủ giấy tờ, bạn chỉ cần mang đến chi nhánh ngân hàng để làm thủ tục vay vốn.`);

  const testMessages = [
    {
      id: 1,
      text: "Xin chào! Tôi muốn biết về thủ tục vay ngân hàng.",
      isBot: false,
      timestamp: new Date()
    },
    {
      id: 2,
      text: testMessage,
      isBot: true,
      timestamp: new Date()
    },
    {
      id: 3,
      text: `Đây là test các định dạng khác:

**Chữ đậm** và *chữ nghiêng*

***Chữ đậm và nghiêng***

__Chữ gạch chân__

~~Chữ gạch ngang~~

\`code inline\`

Danh sách có số:
+ Mục đầu tiên
+ Mục thứ hai
  + Mục con 2.1
  + Mục con 2.2
+ Mục thứ ba`,
      isBot: true,
      timestamp: new Date()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-800">Message Formatting Test</h1>
          <p className="text-gray-600 mt-1">Test page for message formatting functionality</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Test Message Input</h2>
            <textarea
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none font-mono text-sm"
              placeholder="Enter your test message here..."
            />
            <div className="mt-4">
              <button
                onClick={() => setTestMessage('')}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 mr-2"
              >
                Clear
              </button>
              <button
                onClick={() => setTestMessage(`Để vay ngân hàng, bạn cần chuẩn bị một số giấy tờ cơ bản sau:* Chứng minh nhân dân (CMND) hoặc Căn cước công dân (CCCD): Đây là giấy tờ bắt buộc phải có.* Hồ sơ vay vốn: Phụ thuộc vào loại vay và mục đích vay mà bạn cần chuẩn bị: + Vay tín chấp (vay tiêu dùng): Giấy đề nghị vay vốn, hợp đồng tín dụng, giấy tờ chứng minh thu nhập (hợp đồng lao động, sao kê lương, giấy tờ kinh doanh...). + Vay mua nhà đất: Giấy đề nghị vay vốn, hợp đồng tín dụng, giấy đăng ký quyền sử dụng đất, hợp đồng mua bán nhà đất. + Vay sản xuất kinh doanh: Giấy đề nghị vay vốn, hợp đồng tín dụng, giấy phép kinh doanh, giấy đăng ký kinh doanh...* Chứng minh thu nhập: Bạn cần có thu nhập ổn định và đáng kể để chứng minh khả năng trả nợ. Các giấy tờ chứng minh thu nhập thường bao gồm: + Sao kê lương. + Hợp đồng lao động. + Giấy tờ kinh doanh (sổ đăng ký kinh doanh, giấy phép kinh doanh...).* Chứng minh mục đích vay: Bạn cần có mục đích vay rõ ràng và hợp pháp. Ví dụ: mua nhà, mua xe, sản xuất kinh doanh...* Tài sản đảm bảo (nếu có): Bạn có thể sử dụng tài sản như sổ tiết kiệm, bất động sản, xe cộ... để đảm bảo cho vay.Sau khi chuẩn bị đầy đủ giấy tờ, bạn chỉ cần mang đến chi nhánh ngân hàng để làm thủ tục vay vốn.`)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Load Original Example
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Formatted Preview</h2>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <MessageBubble
                message={testMessage}
                isBot={true}
                timestamp={new Date()}
              />
            </div>
          </div>
        </div>

        {/* Test Messages Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Test Conversation</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {testMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg.text}
                isBot={msg.isBot}
                timestamp={msg.timestamp}
              />
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">Formatting Instructions</h3>
          <div className="text-blue-700 space-y-2">
            <p><strong>Bullet Lists:</strong> Use <code>* item</code> or <code>*item</code> (space optional)</p>
            <p><strong>Numbered Lists:</strong> Use <code>+ item</code> or <code>+item</code> (space optional)</p>
            <p><strong>Bold:</strong> Use <code>**text**</code></p>
            <p><strong>Italic:</strong> Use <code>*text*</code> or <code>_text_</code></p>
            <p><strong>Bold + Italic:</strong> Use <code>***text***</code></p>
            <p><strong>Underline:</strong> Use <code>__text__</code></p>
            <p><strong>Strikethrough:</strong> Use <code>~~text~~</code></p>
            <p><strong>Code:</strong> Use <code>`text`</code></p>
            <p><strong>Indentation:</strong> Use 2 spaces per level for nested lists</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageFormattingTestPage;