
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { t } from "@/utils/i18n";

const pricingPlans = [
  {
    name: "pricing.basic",
    price: "199.000",
    period: "pricing.month",
    description: "pricing.basic_desc",
    features: [
      "10 bài viết mỗi tháng",
      "Tối đa 1.000 từ mỗi bài",
      "Tối ưu SEO cơ bản",
      "Kết nối 1 tài khoản WordPress",
      "Hỗ trợ qua email"
    ],
    cta: "pricing.select_basic",
    popular: false
  },
  {
    name: "pricing.professional",
    price: "499.000",
    period: "pricing.month",
    description: "pricing.professional_desc",
    features: [
      "30 bài viết mỗi tháng",
      "Tối đa 2.000 từ mỗi bài",
      "Tối ưu SEO nâng cao",
      "Kết nối 3 tài khoản mạng xã hội",
      "Phân tích nội dung",
      "Hỗ trợ ưu tiên"
    ],
    cta: "pricing.select_professional",
    popular: true
  },
  {
    name: "pricing.enterprise",
    price: "999.000",
    period: "pricing.month",
    description: "pricing.enterprise_desc",
    features: [
      "100 bài viết mỗi tháng",
      "Không giới hạn số từ",
      "Tối ưu SEO cao cấp",
      "Kết nối không giới hạn",
      "Phân tích nội dung chi tiết",
      "Hỗ trợ 24/7",
      "API tích hợp"
    ],
    cta: "pricing.select_enterprise",
    popular: false
  }
];

const Pricing = () => {
  return (
    <div id="pricing" className="container py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">{t("pricing.title")}</h2>
        <p className="text-gray-600 text-lg">
          {t("pricing.description")}
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
                {t("pricing.most_popular")}
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{t(plan.name)}</h3>
              <p className="text-gray-500 mb-4">{t(plan.description)}</p>
              <div className="mb-4">
                <span className="text-3xl font-bold">{plan.price}đ</span>
                <span className="text-gray-500">/{t(plan.period)}</span>
              </div>
              <Link to="/register">
                <Button 
                  className={`w-full ${!plan.popular && 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  {t(plan.cta)}
                </Button>
              </Link>
              <div className="mt-6 space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
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
