
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="container py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Tạo bài viết chuẩn SEO với AI
          </h1>
          <p className="text-xl text-gray-600">
            Tối ưu nội dung cho website, mạng xã hội, bán hàng tự động
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Dùng thử miễn phí
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Bắt đầu ngay
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            Không cần thẻ tín dụng. Bắt đầu với 5 bài viết miễn phí.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1542744173-05336fcc7ad4" 
            alt="AI Content Creation" 
            className="w-full h-auto object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
