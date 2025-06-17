import React from 'react';
import { Link } from 'react-router-dom';
import { IoArrowForward, IoShieldCheckmark, IoSpeedometer, IoChatbubbles, IoStatsChart, IoCard, IoTime, IoPersonOutline } from 'react-icons/io5';
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

      {/* Quick Actions */}
      <section className="py-16 bg-white">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl font-display">
              Thao tác nhanh
            </h2>
            <p className="max-w-2xl mx-auto text-lg text-gray-600">
              Các tính năng thường dùng để bạn có thể truy cập nhanh chóng
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/chat" className="p-6 text-center transition-all border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-blue-600 bg-blue-100 rounded-full">
                <IoChatbubbles size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Chat AI</h3>
              <p className="text-sm text-gray-600">Trò chuyện với trợ lý AI</p>
            </Link>

            <Link to="/profile" className="p-6 text-center transition-all border border-gray-100 rounded-xl hover:shadow-lg hover:border-blue-200">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-green-600 bg-green-100 rounded-full">
                <IoPersonOutline size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Hồ sơ</h3>
              <p className="text-sm text-gray-600">Quản lý thông tin cá nhân</p>
            </Link>

            {user?.balance && (
              <div className="p-6 text-center border border-gray-100 rounded-xl">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-purple-600 bg-purple-100 rounded-full">
                  <IoCard size={24} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Số dư</h3>
                <p className="text-sm font-medium text-purple-600">{user.balance} VND</p>
              </div>
            )}

            <div className="p-6 text-center border border-gray-100 rounded-xl">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-orange-600 bg-orange-100 rounded-full">
                <IoTime size={24} />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">Hỗ trợ 24/7</h3>
              <p className="text-sm text-gray-600">Luôn sẵn sàng hỗ trợ bạn</p>
            </div>
          </div>
          
          {/* Admin Quick Actions */}
          {user && user.is_admin && (
            <div className="mt-12">
              <h3 className="mb-6 text-2xl font-bold text-center text-gray-900">Quản trị hệ thống</h3>
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

      {/* Account Info */}
      {user && (
        <section className="py-16 bg-gray-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="p-8 bg-white rounded-2xl shadow-sm">
              <h2 className="mb-6 text-2xl font-bold text-gray-900">Thông tin tài khoản</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="mb-2 text-sm font-medium text-blue-800">Tên hiển thị</h3>
                  <p className="text-lg font-semibold text-blue-900">{getDisplayName()}</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="mb-2 text-sm font-medium text-green-800">Email</h3>
                  <p className="text-lg font-semibold text-green-900 break-all">{user.email}</p>
                </div>
                
                {user.username && (
                  <div className="p-4 bg-cyan-50 rounded-lg">
                    <h3 className="mb-2 text-sm font-medium text-cyan-800">Tên đăng nhập</h3>
                    <p className="text-lg font-semibold text-cyan-900">{user.username}</p>
                  </div>
                )}
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="mb-2 text-sm font-medium text-purple-800">Vai trò</h3>
                  <p className="text-lg font-semibold text-purple-900">
                    {user.is_admin ? 'Quản trị viên' : 'Khách hàng'}
                  </p>
                </div>
                
                {user.accountNumber && (
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h3 className="mb-2 text-sm font-medium text-orange-800">Số tài khoản</h3>
                    <p className="text-lg font-semibold text-orange-900">{user.accountNumber}</p>
                  </div>
                )}
                
                {user.phone && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h3 className="mb-2 text-sm font-medium text-indigo-800">Số điện thoại</h3>
                    <p className="text-lg font-semibold text-indigo-900">{user.phone}</p>
                  </div>
                )}
                
                {user.department && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="mb-2 text-sm font-medium text-gray-800">Phòng ban</h3>
                    <p className="text-lg font-semibold text-gray-900">{user.department}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
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
