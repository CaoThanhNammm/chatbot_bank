export const mockMessages = [
  {
    id: 1,
    text: "Xin chào! Tôi là VietBank AI, trợ lý thông minh của VietBank. Tôi có thể giúp bạn với các dịch vụ ngân hàng, tư vấn tài chính và giải đáp thắc mắc. Hôm nay tôi có thể hỗ trợ gì cho bạn?",
    isBot: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: 2,
    text: "Chào bạn! Tôi muốn biết về các loại tài khoản tiết kiệm hiện tại của VietBank.",
    isBot: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
  },
  {
    id: 3,
    text: "VietBank hiện có các gói tiết kiệm sau:\n\n• **Tiết kiệm thường** - Lãi suất 4.5%/năm, gửi tối thiểu 1 triệu VNĐ\n• **Tiết kiệm VIP** - Lãi suất 5.2%/năm, gửi tối thiểu 100 triệu VNĐ\n• **Tiết kiệm kỳ hạn** - Lãi suất từ 5.8% - 7.2%/năm tùy kỳ hạn\n• **Tiết kiệm tích lũy** - Gửi đều đặn hàng tháng, lãi suất ưu đãi\n\nBạn quan tâm đến loại tài khoản nào? Tôi có thể tư vấn chi tiết hơn.",
    isBot: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 3), // 3 minutes ago
  },
  {
    id: 4,
    text: "Tôi có khoảng 50 triệu muốn gửi tiết kiệm 12 tháng. Lãi suất bao nhiêu?",
    isBot: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
  },
  {
    id: 5,
    text: "Với số tiền 50 triệu VNĐ gửi kỳ hạn 12 tháng:\n\n**Lãi suất: 6.8%/năm**\n• Lãi tính theo tháng: ~283,000 VNĐ\n• Tổng lãi sau 12 tháng: ~3,4 triệu VNĐ\n• Tổng tiền nhận được: ~53,4 triệu VNĐ\n\n**Ưu đãi thêm:**\n• Miễn phí chuyển khoản trong hệ thống VietBank\n• Ưu tiên phục vụ tại quầy\n• Tham gia chương trình tích điểm\n\nBạn có muốn tôi hướng dẫn thủ tục mở tài khoản tiết kiệm không?",
    isBot: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 1), // 1 minute ago
  }
];

export const samplePrompts = [
  "Tôi muốn biết về dịch vụ chuyển tiền",
  "Hướng dẫn mở tài khoản tiết kiệm",
  "Lãi suất vay mua nhà hiện tại",
  "Cách tính phí dịch vụ ngân hàng",
  "Thủ tục làm thẻ tín dụng",
  "Kiểm tra số dư tài khoản",
  "Tư vấn đầu tư tài chính",
  "Hướng dẫn sử dụng Internet Banking"
];
