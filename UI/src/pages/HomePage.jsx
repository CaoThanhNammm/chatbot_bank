import React from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward, IoShieldCheckmark, IoSpeedometer, IoChatbubbles } from 'react-icons/io5';
import { Button, Header, Footer } from '../components';

const HomePage = () => {
  const features = [
    {
      icon: <IoChatbubbles size={24} />,
      title: 'Trợ lý AI thông minh',
      description: 'Chatbot tự động hỗ trợ 24/7 cho mọi thắc mắc ngân hàng'
    },
    {
      icon: <IoShieldCheckmark size={24} />,
      title: 'Bảo mật tuyệt đối',
      description: 'Công nghệ bảo mật tiên tiến, mã hóa dữ liệu toàn diện'
    },
    {
      icon: <IoSpeedometer size={24} />,
      title: 'Xử lý nhanh chóng',
      description: 'Phản hồi tức thì, giải quyết vấn đề trong vài giây'
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-gray-900 mb-6">
              Trợ lý AI <span className="text-blue-600">Ngân hàng</span>
              <br />Thông minh nhất Việt Nam
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Giải đáp mọi thắc mắc về dịch vụ ngân hàng, hướng dẫn giao dịch, 
              và hỗ trợ khách hàng 24/7 với công nghệ AI tiên tiến.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link to="/chat">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Bắt đầu trò chuyện
                  <IoArrowForward className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg" className="px-8 py-4 text-lg">
                  Tạo tài khoản miễn phí
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Tính năng nổi bật
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những tính năng giúp VietBank AI trở thành trợ lý ngân hàng hoàn hảo cho bạn
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-8 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cùng hàng nghìn khách hàng đã tin tưởng VietBank AI
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg" className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-50">
              Đăng ký ngay miễn phí
            </Button>
          </Link>
        </div>
      </section>      <Footer />
    </div>
  );
};

export default HomePage;
