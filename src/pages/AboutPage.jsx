import React from 'react';
import { Link } from 'react-router-dom';
import { IoShieldCheckmark, IoSpeedometer, IoChatbubbles, IoTrendingUp, IoGlobeOutline, IoRocketOutline } from 'react-icons/io5';
import { Button, Header, Footer } from '../components';

const AboutPage = () => {
  const features = [
    {
      icon: <IoChatbubbles size={32} />,
      title: 'Trí tuệ nhân tạo tiên tiến',
      description: 'Sử dụng công nghệ AI và Machine Learning để hiểu và phản hồi chính xác các câu hỏi phức tạp về ngân hàng.'
    },
    {
      icon: <IoShieldCheckmark size={32} />,
      title: 'Bảo mật đa lớp',
      description: 'Hệ thống bảo mật ngân hàng cấp độ quốc tế với mã hóa 256-bit và xác thực đa yếu tố.'
    },
    {
      icon: <IoSpeedometer size={32} />,
      title: 'Xử lý siêu tốc',
      description: 'Phản hồi trong vòng dưới 1 giây, xử lý hàng nghìn truy vấn đồng thời mà không bị chậm trễ.'
    },
    {
      icon: <IoTrendingUp size={32} />,
      title: 'Phân tích thông minh',
      description: 'Cung cấp insights tài chính cá nhân hóa và đề xuất sản phẩm phù hợp với từng khách hàng.'
    },
    {
      icon: <IoGlobeOutline size={32} />,
      title: 'Đa ngôn ngữ',
      description: 'Hỗ trợ tiếng Việt và tiếng Anh, hiểu được cả ngôn ngữ thông tục và thuật ngữ chuyên ngành.'
    },
    {
      icon: <IoRocketOutline size={32} />,
      title: 'Cập nhật liên tục',
      description: 'Học hỏi và cải thiện từ mọi tương tác để mang đến trải nghiệm ngày càng tốt hơn.'
    }
  ];

  const stats = [
    { number: '100K+', label: 'Khách hàng tin tưởng' },
    { number: '1M+', label: 'Câu hỏi được giải đáp' },
    { number: '99.9%', label: 'Độ chính xác' },
    { number: '24/7', label: 'Hỗ trợ không ngừng' }
  ];

  const timeline = [
    {
      year: '2023',
      title: 'Khởi đầu dự án',
      description: 'Bắt đầu nghiên cứu và phát triển AI chatbot cho ngành ngân hàng Việt Nam.'
    },
    {
      year: '2024',
      title: 'Ra mắt Beta',
      description: 'Phiên bản thử nghiệm với 1000 khách hàng đầu tiên, đạt độ hài lòng 95%.'
    },
    {
      year: '2025',
      title: 'Chính thức hoạt động',
      description: 'Ra mắt chính thức với đầy đủ tính năng và mở rộng ra toàn quốc.'
    },
    {
      year: 'Tương lai',
      title: 'Mở rộng khu vực',
      description: 'Kế hoạch phủ sóng toàn Đông Nam Á và tích hợp thêm nhiều dịch vụ mới.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Về VietBank AI
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Chúng tôi đang cách mạng hóa ngành ngân hàng Việt Nam bằng công nghệ 
              trí tuệ nhân tạo tiên tiến nhất thế giới.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-6">
                Sứ mệnh của chúng tôi
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                VietBank AI được sinh ra với sứ mệnh democratize việc tiếp cận dịch vụ ngân hàng 
                chất lượng cao cho mọi người dân Việt Nam. Chúng tôi tin rằng mọi ai cũng xứng đáng 
                có được sự hỗ trợ tài chính thông minh và kịp thời.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Với công nghệ AI tiên tiến, chúng tôi giúp khách hàng tiết kiệm thời gian, 
                đưa ra quyết định tài chính thông minh và trải nghiệm dịch vụ ngân hàng 
                một cách dễ dàng, thuận tiện nhất.
              </p>
              <Link to="/chat">
                <Button size="lg" className="px-8 py-4">
                  Trải nghiệm ngay
                </Button>
              </Link>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-2xl">
              <div className="grid grid-cols-2 gap-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Công nghệ đột phá
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Những tính năng vượt trội giúp VietBank AI trở thành trợ lý ngân hàng 
              thông minh nhất Việt Nam
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mb-6 text-blue-600">
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

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Hành trình phát triển
            </h2>
            <p className="text-lg text-gray-600">
              Từ ý tưởng đến hiện thực - câu chuyện về VietBank AI
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-200"></div>
            
            {timeline.map((item, index) => (
              <div key={index} className={`relative flex items-center justify-between mb-8 ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="text-blue-600 font-bold text-lg mb-2">
                      {item.year}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
                
                {/* Timeline dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
                
                <div className="w-5/12"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
            Sẵn sàng khám phá tương lai ngân hàng?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Tham gia cùng hàng nghìn khách hàng đã trải nghiệm VietBank AI
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/chat">
              <Button variant="secondary" size="lg" className="px-8 py-4 text-lg bg-white text-blue-600 hover:bg-gray-50">
                Bắt đầu chat ngay
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg border-white text-white hover:bg-white hover:text-blue-600">
                Liên hệ tư vấn
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
