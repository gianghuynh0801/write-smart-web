
import { Check } from "lucide-react";

const features = [
  {
    title: "Tạo nội dung tức thì",
    description: "Tạo bài viết chỉ trong vài giây với công nghệ AI tiên tiến",
    icon: "⚡"
  },
  {
    title: "Tối ưu hóa SEO",
    description: "Mọi bài viết đều được tối ưu tự động cho các công cụ tìm kiếm",
    icon: "🔍"
  },
  {
    title: "Đa nền tảng",
    description: "Đăng bài trực tiếp lên WordPress, Facebook, TikTok và nhiều nền tảng khác",
    icon: "🌐"
  },
  {
    title: "Phân tích dữ liệu",
    description: "Báo cáo chi tiết về hiệu suất nội dung và đề xuất cải thiện",
    icon: "📊"
  },
  {
    title: "Hỗ trợ đa ngôn ngữ",
    description: "Tạo nội dung bằng tiếng Việt và tiếng Anh với chất lượng cao",
    icon: "🔤"
  },
  {
    title: "Lưu trữ an toàn",
    description: "Tất cả bài viết được lưu trữ an toàn và dễ dàng truy cập bất cứ khi nào",
    icon: "🔒"
  }
];

const Features = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Tính năng nổi bật</h2>
          <p className="text-gray-600 text-lg">
            WriteSmart cung cấp đầy đủ công cụ để tạo và quản lý nội dung SEO chất lượng cao
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
