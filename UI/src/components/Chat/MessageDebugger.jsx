import React, { useState } from 'react';

const MessageDebugger = () => {
  const [testText, setTestText] = useState(`•*🏡 Bạn có thể vay được số tiền 5 tỷ để mua nhà tại Agribank!*
👉 Vay được bao nhiều:** Bạn có thể vay tối đa đến 80% giá trị nhà mà mình mua (tức là 4 tỷ đồng).
•**
📑 Tài sản đảm bảo:** Bạn sẽ cần phải đảm bảo bằng cách thế chấp nhà bạn mới mua.
•💵 Số tiền phải trả: Bạn chỉ cần trả góp 20% giá trị nhà (1 tỷ đồng) và thanh toán lãi suất.
•📆 Thời gian vay: Thời gian vay tín dụng nhà ở tại Agribank trung bình từ 5 đến 20 năm.Để biết thêm chi tiết, bạn vui lòng mang CMND/CCCD đến chi nhánh Agribank để được tư vấn!`);

  // Simulate the preprocessing steps
  const debugPreprocess = (text) => {
    console.log('=== DEBUG PREPROCESSING ===');
    console.log('Original:', text);
    
    let step1 = text
      .replace(/•\*([^*]+)\*/g, '• *$1*')
      .replace(/•\*\*([^*]+)\*\*/g, '• **$1**');
    console.log('Step 1 - Fix bullet formatting:', step1);
    
    let step2 = step1
      .replace(/([^*]):\*\*\s*([^*\n]+?)([.!?])/g, '$1: **$2**$3');
    console.log('Step 2 - Fix incomplete bold:', step2);
    
    let step3 = step2
      .replace(/^•\*\*\s*$/gm, '')
      .replace(/^\*\*\s*$/gm, '')
      .replace(/^•\s*$/gm, '');
    console.log('Step 3 - Remove empty bullets:', step3);
    
    let step4 = step3
      .replace(/([^:\s]):([^\s])/g, '$1: $2')
      .replace(/([a-z])([A-Z])/g, '$1 $2');
    console.log('Step 4 - Fix spacing:', step4);
    
    let step5 = step4
      .replace(/([^\n\s])👉/g, '$1\n👉')
      .replace(/([^\n\s])(🚀|📄|📑|📈|🏡|💵|📆)/g, '$1\n$2');
    console.log('Step 5 - Add line breaks before emojis:', step5);
    
    let final = step5
      .replace(/\n{3,}/g, '\n\n');
    console.log('Final result:', final);
    
    return final;
  };

  const handleDebug = () => {
    debugPreprocess(testText);
  };

  return (
    <div className="p-4 bg-white border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Message Preprocessor Debugger</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Test Text:</label>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full h-32 p-2 border border-gray-300 rounded text-sm font-mono"
        />
      </div>
      
      <button
        onClick={handleDebug}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Debug Preprocessing (Check Console)
      </button>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Click the button above and check the browser console (F12) to see step-by-step preprocessing.</p>
      </div>
    </div>
  );
};

export default MessageDebugger;