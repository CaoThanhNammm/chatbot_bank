import React from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward, IoShieldCheckmark, IoSpeedometer, IoChatbubbles, IoStatsChart, IoCard, IoTime, IoPersonOutline, IoNewspaper, IoTrendingUp, IoCash, IoHome, IoSchool, IoBusinessOutline } from 'react-icons/io5';
import { Button, Header, Footer } from '../components';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { authenticated, user } = useAuth();

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

  const getDisplayName = () => {
    if (!user) return 'Khách hàng';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    // If we have only first_name or last_name
    if (user.first_name) {
      return user.first_name;
    }
    if (user.last_name) {
      return user.last_name;
    }
    
    if (user.name) {
      return user.name;
    }
    
    return user.username || user.email || 'Khách hàng';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  // Component cho người dùng đã đăng nhập
  const AuthenticatedHome = () => (
    <>
      {/* Welcome Section */}
      <section className="pt-20 pb-16">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl font-display">
              {getGreeting()}, <span className="text-blue-600">{getDisplayName()}</span>!
            </h1>
            <p className="max-w-2xl mx-auto mb-8 text-xl leading-relaxed text-gray-600">
              Chào mừng bạn quay trở lại với AGRIBANK AI. Hãy bắt đầu trò chuyện để được hỗ trợ tốt nhất.
            </p>
            
            <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
              <Link to="/chat">
                <Button size="lg" className="px-8 py-4 text-lg">
                  Bắt đầu trò chuyện
                  <IoChatbubbles className="ml-2" size={20} />
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="secondary" size="lg" className="px-8 py-4 text-lg">
                  Xem hồ sơ cá nhân
                  <IoPersonOutline className="ml-2" size={20} />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* News and Announcements */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl font-display">
              Tin tức & Thông báo
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Cập nhật những thông tin mới nhất từ AGRIBANK
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-6 transition-all bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-blue-600 bg-blue-100 rounded-full">
                <IoNewspaper size={24} />
              </div>
              <div className="mb-2 text-xs font-medium text-blue-600 uppercase tracking-wide">
                15/12/2024
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Ra mắt tính năng AI Banking mới
              </h3>
              <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                AGRIBANK chính thức triển khai hệ thống trợ lý AI thông minh, hỗ trợ khách hàng 24/7 với khả năng xử lý ngôn ngữ tự nhiên tiên tiến.
              </p>
              <div className="text-sm font-medium text-blue-600 cursor-pointer hover:text-blue-800">
                Đọc thêm →
              </div>
            </div>

            <div className="p-6 transition-all bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-green-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-green-600 bg-green-100 rounded-full">
                <IoTrendingUp size={24} />
              </div>
              <div className="mb-2 text-xs font-medium text-green-600 uppercase tracking-wide">
                12/12/2024
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Ưu đãi lãi suất tiết kiệm tháng 12
              </h3>
              <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                Áp dụng lãi suất ưu đãi lên đến 6.5%/năm cho các kỳ hạn từ 12 tháng trở lên. Chương trình có hiệu lực đến hết tháng 12/2024.
              </p>
              <div className="text-sm font-medium text-green-600 cursor-pointer hover:text-green-800">
                Xem chi tiết →
              </div>
            </div>

            <div className="p-6 transition-all bg-white border border-gray-100 rounded-xl hover:shadow-lg hover:border-purple-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-purple-600 bg-purple-100 rounded-full">
                <IoShieldCheckmark size={24} />
              </div>
              <div className="mb-2 text-xs font-medium text-purple-600 uppercase tracking-wide">
                10/12/2024
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Nâng cấp bảo mật hệ thống
              </h3>
              <p className="mb-4 text-sm text-gray-600 line-clamp-3">
                Triển khai công nghệ xác thực sinh trắc học và mã hóa đa lớp nhằm đảm bảo an toàn tuyệt đối cho mọi giao dịch của khách hàng.
              </p>
              <div className="text-sm font-medium text-purple-600 cursor-pointer hover:text-purple-800">
                Tìm hiểu thêm →
              </div>
            </div>
          </div>

          {/* Admin Quick Actions - Keep for admin users */}
          {user && user.is_admin && (
            <div className="mt-16 pt-12 border-t border-gray-200">
              <h3 className="mb-8 text-2xl font-bold text-center text-gray-900">Quản trị hệ thống</h3>
              <div className="grid gap-6 md:grid-cols-2">
                <Link to="/admin/users" className="p-6 text-center transition-all border border-red-100 rounded-xl hover:shadow-lg hover:border-red-200 bg-red-50">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-red-600 bg-red-100 rounded-full">
                    <IoPersonOutline size={24} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Quản lý người dùng</h3>
                  <p className="text-sm text-gray-600">Quản lý tài khoản và quyền hạn</p>
                </Link>

                <Link to="/admin/fine-tuning" className="p-6 text-center transition-all border border-indigo-100 rounded-xl hover:shadow-lg hover:border-indigo-200 bg-indigo-50">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-indigo-600 bg-indigo-100 rounded-full">
                    <IoStatsChart size={24} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">Fine-tuning Model</h3>
                  <p className="text-sm text-gray-600">Huấn luyện và tối ưu AI model</p>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Banking Services and Products */}
      <section className="py-16 bg-gray-50">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl font-display">
              Dịch vụ & Sản phẩm nổi bật
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Khám phá các sản phẩm và dịch vụ ngân hàng hiện đại của AGRIBANK
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-8 transition-all bg-white rounded-2xl shadow-sm hover:shadow-lg hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-green-600 bg-green-100 rounded-full">
                <IoCash size={28} />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center text-gray-900">
                Tiết kiệm Online
              </h3>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lãi suất:</span>
                  <span className="text-sm font-semibold text-green-600">Lên đến 6.5%/năm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Kỳ hạn:</span>
                  <span className="text-sm font-semibold text-gray-900">1-36 tháng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Số tiền tối thiểu:</span>
                  <span className="text-sm font-semibold text-gray-900">100.000 VND</span>
                </div>
              </div>
              <p className="mb-6 text-sm text-center text-gray-600">
                Gửi tiết kiệm trực tuyến với lãi suất hấp dẫn, linh hoạt thời gian
              </p>
              <div className="text-center">
                <Button size="sm" className="px-6 py-2">
                  Mở tài khoản
                </Button>
              </div>
            </div>

            <div className="p-8 transition-all bg-white rounded-2xl shadow-sm hover:shadow-lg hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-blue-600 bg-blue-100 rounded-full">
                <IoHome size={28} />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center text-gray-900">
                Vay mua nhà
              </h3>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lãi suất:</span>
                  <span className="text-sm font-semibold text-blue-600">Từ 6.8%/năm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Thời hạn:</span>
                  <span className="text-sm font-semibold text-gray-900">Lên đến 25 năm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tỷ lệ cho vay:</span>
                  <span className="text-sm font-semibold text-gray-900">Lên đến 85%</span>
                </div>
              </div>
              <p className="mb-6 text-sm text-center text-gray-600">
                Hiện thực hóa giấc mơ sở hữu ngôi nhà với lãi suất ưu đãi
              </p>
              <div className="text-center">
                <Button size="sm" variant="secondary" className="px-6 py-2">
                  Tư vấn ngay
                </Button>
              </div>
            </div>

            <div className="p-8 transition-all bg-white rounded-2xl shadow-sm hover:shadow-lg hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-purple-600 bg-purple-100 rounded-full">
                <IoSchool size={28} />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center text-gray-900">
                Vay học tập
              </h3>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lãi suất:</span>
                  <span className="text-sm font-semibold text-purple-600">Từ 5.5%/năm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hạn mức:</span>
                  <span className="text-sm font-semibold text-gray-900">Lên đến 500 triệu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ân hạn:</span>
                  <span className="text-sm font-semibold text-gray-900">Trong thời gian học</span>
                </div>
              </div>
              <p className="mb-6 text-sm text-center text-gray-600">
                Đầu tư cho tương lai với gói vay học tập ưu đãi đặc biệt
              </p>
              <div className="text-center">
                <Button size="sm" variant="secondary" className="px-6 py-2">
                  Đăng ký vay
                </Button>
              </div>
            </div>

            <div className="p-8 transition-all bg-white rounded-2xl shadow-sm hover:shadow-lg hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-orange-600 bg-orange-100 rounded-full">
                <IoCard size={28} />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center text-gray-900">
                Thẻ tín dụng
              </h3>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hạn mức:</span>
                  <span className="text-sm font-semibold text-orange-600">Lên đến 1 tỷ VND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Miễn phí:</span>
                  <span className="text-sm font-semibold text-gray-900">Năm đầu tiên</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hoàn tiền:</span>
                  <span className="text-sm font-semibold text-gray-900">Lên đến 2%</span>
                </div>
              </div>
              <p className="mb-6 text-sm text-center text-gray-600">
                Thanh toán thông minh với nhiều ưu đãi và tích lũy điểm thưởng
              </p>
              <div className="text-center">
                <Button size="sm" className="px-6 py-2">
                  Đăng ký thẻ
                </Button>
              </div>
            </div>

            <div className="p-8 transition-all bg-white rounded-2xl shadow-sm hover:shadow-lg hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-indigo-600 bg-indigo-100 rounded-full">
                <IoTrendingUp size={28} />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center text-gray-900">
                Đầu tư chứng khoán
              </h3>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phí giao dịch:</span>
                  <span className="text-sm font-semibold text-indigo-600">Từ 0.15%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Số dư tối thiểu:</span>
                  <span className="text-sm font-semibold text-gray-900">10 triệu VND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hỗ trợ:</span>
                  <span className="text-sm font-semibold text-gray-900">Tư vấn chuyên nghiệp</span>
                </div>
              </div>
              <p className="mb-6 text-sm text-center text-gray-600">
                Đầu tư thông minh với nền tảng giao dịch hiện đại và an toàn
              </p>
              <div className="text-center">
                <Button size="sm" variant="secondary" className="px-6 py-2">
                  Tìm hiểu thêm
                </Button>
              </div>
            </div>

            <div className="p-8 transition-all bg-white rounded-2xl shadow-sm hover:shadow-lg hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 text-teal-600 bg-teal-100 rounded-full">
                <IoBusinessOutline size={28} />
              </div>
              <h3 className="mb-4 text-xl font-semibold text-center text-gray-900">
                Tài khoản doanh nghiệp
              </h3>
              <div className="mb-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Phí duy trì:</span>
                  <span className="text-sm font-semibold text-teal-600">Miễn phí 6 tháng</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Giao dịch:</span>
                  <span className="text-sm font-semibold text-gray-900">Không giới hạn</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Internet Banking:</span>
                  <span className="text-sm font-semibold text-gray-900">Miễn phí</span>
                </div>
              </div>
              <p className="mb-6 text-sm text-center text-gray-600">
                Giải pháp tài chính toàn diện cho doanh nghiệp mọi quy mô
              </p>
              <div className="text-center">
                <Button size="sm" variant="secondary" className="px-6 py-2">
                  Mở tài khoản
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  // Component cho người dùng chưa đăng nhập (giữ nguyên như cũ)
  const GuestHome = () => (
    <>
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
              Những tính năng giúp AGRIBANK AI trở thành trợ lý ngân hàng hoàn hảo cho bạn
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
            Tham gia cùng hàng nghìn khách hàng đã tin tưởng AGRIBANK AI
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
      </section>
    </>
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      
      {authenticated ? <AuthenticatedHome /> : <GuestHome />}
      
      <Footer />
    </div>
  );
};

export default HomePage;
