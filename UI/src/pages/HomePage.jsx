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
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl font-display">
              Trợ lý AI <span className="text-blue-600">Ngân hàng</span>
              <br />Thông minh nhất Việt Nam
            </h1>
            <p className="max-w-3xl mx-auto mb-8 text-xl leading-relaxed text-gray-600">
              Giải đáp mọi thắc mắc về dịch vụ ngân hàng, hướng dẫn giao dịch, 
              và hỗ trợ khách hàng 24/7 với công nghệ AI tiên tiến.
            </p>
            
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
              <Link to="/guest-chat">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Bắt đầu trò chuyện ngay
                  <IoArrowForward className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="lg" className="px-8 py-4 text-lg">
                  Tạo tài khoản miễn phí
                </Button>
              </Link>
            </div>
            <div className="mt-4 text-center">
              <p className="text-gray-600">
                Đã có tài khoản? <Link to="/login" className="text-blue-600 hover:underline">Đăng nhập</Link> hoặc <Link to="/guest-chat" className="text-blue-600 hover:underline">trò chuyện không cần đăng nhập</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl font-display">
              Tính năng nổi bật
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Những tính năng giúp VietBank AI trở thành trợ lý ngân hàng hoàn hảo cho bạn
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={index} className="p-8 text-center transition-shadow border border-gray-100 rounded-xl hover:shadow-lg">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-blue-600 bg-blue-100 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="mb-4 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl px-4 mx-auto text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold text-white md:text-4xl font-display">
            Sẵn sàng trải nghiệm?
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            Tham gia cùng hàng nghìn khách hàng đã tin tưởng VietBank AI
          </p>
          <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
            <Link to="/guest-chat">
              <Button variant="secondary" size="lg" className="px-8 py-4 text-lg text-blue-600 bg-white hover:bg-gray-50">
                Trò chuyện ngay
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg text-white bg-transparent border-white hover:bg-blue-700">
                Đăng ký tài khoản
              </Button>
            </Link>
          </div>
        </div>
      </section>      <Footer />
    </div>
  );
};

export default HomePage;
