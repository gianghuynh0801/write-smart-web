
import { Check } from "lucide-react";

const features = [
  {
    title: "Tạo nội dung nhanh chóng",
    description: "Tạo bài viết chuẩn SEO trong vài phút thay vì hàng giờ viết thủ công",
    icon: "⚡"
  },
  {
    title: "Tối ưu hoá SEO",
    description: "Nội dung được tối ưu hoá cho công cụ tìm kiếm, giúp nâng cao thứ hạng website",
    icon: "🔍"
  },
  {
    title: "Đa nền tảng",
    description: "Tạo nội dung cho website, Facebook, Instagram và nhiều nền tảng khác",
    icon: "🌐"
  },
  {
    title: "Phân tích dữ liệu",
    description: "Theo dõi hiệu suất nội dung và nhận báo cáo chi tiết về tương tác",
    icon: "📊"
  },
  {
    title: "Đa ngôn ngữ",
    description: "Tạo nội dung bằng nhiều ngôn ngữ khác nhau, phù hợp với đối tượng toàn cầu",
    icon: "🔤"
  },
  {
    title: "Lưu trữ an toàn",
    description: "Dữ liệu được mã hóa và lưu trữ an toàn trên đám mây, truy cập mọi lúc mọi nơi",
    icon: "🔒"
  }
];

const Features = () => {
  return (
    <div id="features" className="bg-gray-50 py-16">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Tính năng nổi bật</h2>
          <p className="text-gray-600 text-lg">
            Khám phá những công cụ mạnh mẽ giúp bạn tạo nội dung chất lượng một cách dễ dàng
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
