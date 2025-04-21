
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface PricingFeature {
  vi: string;
  en: string;
}

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: PricingFeature[];
  cta: string;
  popular: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Gói Cơ bản",
    price: "199.000",
    period: "tháng",
    description: "Dành cho người mới bắt đầu",
    features: [
      { vi: "10 bài viết mỗi tháng", en: "" },
      { vi: "Tối đa 1.000 từ mỗi bài", en: "" },
      { vi: "Tối ưu SEO cơ bản", en: "" },
      { vi: "Kết nối 1 tài khoản WordPress", en: "" },
      { vi: "Hỗ trợ qua email", en: "" }
    ],
    cta: "Chọn gói Cơ bản",
    popular: false
  },
  {
    name: "Gói Chuyên nghiệp",
    price: "499.000",
    period: "tháng",
    description: "Dành cho doanh nghiệp nhỏ",
    features: [
      { vi: "30 bài viết mỗi tháng", en: "" },
      { vi: "Tối đa 2.000 từ mỗi bài", en: "" },
      { vi: "Tối ưu SEO nâng cao", en: "" },
      { vi: "Kết nối 3 tài khoản mạng xã hội", en: "" },
      { vi: "Phân tích nội dung", en: "" },
      { vi: "Hỗ trợ ưu tiên", en: "" }
    ],
    cta: "Chọn gói Chuyên nghiệp",
    popular: true
  },
  {
    name: "Gói Doanh nghiệp",
    price: "999.000",
    period: "tháng",
    description: "Dành cho doanh nghiệp lớn",
    features: [
      { vi: "100 bài viết mỗi tháng", en: "" },
      { vi: "Không giới hạn số từ", en: "" },
      { vi: "Tối ưu SEO cao cấp", en: "" },
      { vi: "Kết nối không giới hạn", en: "" },
      { vi: "Phân tích nội dung chi tiết", en: "" },
      { vi: "Hỗ trợ 24/7", en: "" },
      { vi: "API tích hợp", en: "" }
    ],
    cta: "Chọn gói Doanh nghiệp",
    popular: false
  }
];

const Pricing = () => {
  // remove useI18n, t, và locale hoàn toàn
  const [currentLocale] = useState('vi');
  
  return (
    <div id="pricing" className="container py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">Bảng giá dịch vụ</h2>
        <p className="text-gray-600 text-lg">
          Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {pricingPlans.map((plan, index) => (
          <div 
            key={index} 
            className={`bg-white rounded-lg border ${
              plan.popular ? 'border-primary shadow-lg' : 'border-gray-200'
            } overflow-hidden`}
          >
            {plan.popular && (
              <div className="bg-primary text-white text-center py-1.5 text-sm font-medium">
                Phổ biến nhất
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
              <p className="text-gray-500 mb-4">{plan.description}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}đ</span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              <Link to="/register">
                <Button 
                  className={`w-full ${!plan.popular && 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  {plan.cta}
                </Button>
              </Link>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">
                      {feature.vi}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
