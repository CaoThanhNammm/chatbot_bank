import React, { useState } from 'react';
import { IoCall, IoMail, IoLocation, IoTime, IoSend, IoCheckmarkCircle } from 'react-icons/io5';
import { Button, Input, Header, Footer } from '../components';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: <IoCall size={24} />,
      title: 'Hotline 24/7',
      content: '1800 588 888',
      description: 'Miễn phí từ điện thoại cố định'
    },
    {
      icon: <IoMail size={24} />,
      title: 'Email hỗ trợ',
      content: 'support@AGRIBANK-ai.com',
      description: 'Phản hồi trong vòng 2 giờ'
    },
    {
      icon: <IoLocation size={24} />,
      title: 'Địa chỉ văn phòng',
      content: '123 Đường Lê Lợi, Quận 1, TP.HCM',
      description: 'Thứ 2 - Thứ 6: 8:00 - 17:00'
    },
    {
      icon: <IoTime size={24} />,
      title: 'Giờ hoạt động',
      content: '24/7 - Không ngừng nghỉ',
      description: 'AI chatbot luôn sẵn sàng'
    }
  ];

  const faqItems = [
    {
      question: 'AGRIBANK AI có miễn phí không?',
      answer: 'Có, AGRIBANK AI hoàn toàn miễn phí cho khách hàng. Bạn chỉ cần đăng ký tài khoản để sử dụng.'
    },
    {
      question: 'Tôi có thể hỏi những gì với AGRIBANK AI?',
      answer: 'Bạn có thể hỏi về mọi dịch vụ ngân hàng: mở tài khoản, chuyển tiền, vay vốn, đầu tư, bảo hiểm, và nhiều hơn nữa.'
    },
    {
      question: 'Thông tin của tôi có được bảo mật không?',
      answer: 'Tuyệt đối. Chúng tôi sử dụng mã hóa cấp ngân hàng và tuân thủ các tiêu chuẩn bảo mật quốc tế nghiêm ngặt.'
    },
    {
      question: 'AGRIBANK AI có thể thực hiện giao dịch không?',
      answer: 'Hiện tại AGRIBANK AI chỉ tư vấn và hướng dẫn. Mọi giao dịch cần được thực hiện qua kênh chính thức của ngân hàng.'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }, 3000);
  };  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-700 via-red-800 to-red-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Liên hệ với chúng tôi
            </h1>
            <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. 
              Hãy liên hệ bất cứ khi nào bạn cần!
            </p>
          </div>
        </div>
      </section>      {/* Contact Info */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="text-center p-6 bg-red-50 rounded-xl hover:shadow-lg transition-shadow border border-red-200">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-700">
                  {info.icon}
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">
                  {info.title}
                </h3>
                <p className="text-red-700 font-medium mb-1">
                  {info.content}
                </p>
                <p className="text-sm text-red-800">
                  {info.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20 bg-gradient-to-br from-red-50 to-pink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-red-200">
              <h2 className="text-2xl font-bold text-red-900 mb-6">
                Gửi tin nhắn cho chúng tôi
              </h2>
                {isSubmitted ? (
                <div className="text-center py-12">
                  <IoCheckmarkCircle size={64} className="text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-red-900 mb-2">
                    Cảm ơn bạn đã liên hệ!
                  </h3>
                  <p className="text-red-800">
                    Chúng tôi sẽ phản hồi trong vòng 24 giờ.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-800 mb-2">
                        Họ và tên *
                      </label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>                    <div>
                      <label className="block text-sm font-medium text-red-800 mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Nhập địa chỉ email"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-800 mb-2">
                        Số điện thoại
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Nhập số điện thoại"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-red-800 mb-2">
                        Chủ đề *
                      </label>
                      <select 
                        className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        required
                      >
                        <option value="">Chọn chủ đề</option>
                        <option value="support">Hỗ trợ kỹ thuật</option>
                        <option value="feedback">Góp ý sản phẩm</option>
                        <option value="partnership">Hợp tác kinh doanh</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-red-800 mb-2">
                      Nội dung tin nhắn *
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={6}
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Nhập nội dung tin nhắn..."
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800">
                    <IoSend className="mr-2" size={20} />
                    Gửi tin nhắn
                  </Button>
                </form>
              )}
            </div>

            {/* Map & Office Info */}
            <div>
              <div className="bg-white p-8 rounded-xl shadow-sm mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  Văn phòng chính
                </h3>                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <IoLocation size={20} className="text-red-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Địa chỉ</p>
                      <p className="text-gray-600">123 Đường Lê Lợi, Quận 1, TP.HCM</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <IoTime size={20} className="text-red-600 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Giờ làm việc</p>
                      <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                      <p className="text-gray-600">Thứ 7: 8:00 - 12:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Placeholder Map */}
              <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <IoLocation size={48} className="text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Bản đồ văn phòng</p>
                  <p className="text-sm text-gray-400">123 Đường Lê Lợi, Q1, TP.HCM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Câu hỏi thường gặp
            </h2>
            <p className="text-lg text-gray-600">
              Tìm câu trả lời nhanh cho những thắc mắc phổ biến
            </p>
          </div>

          <div className="space-y-6">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {item.question}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Không tìm thấy câu trả lời bạn cần?
            </p>
            <Button variant="outline" size="lg">
              <IoMail className="mr-2" size={20} />
              Liên hệ trực tiếp
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
