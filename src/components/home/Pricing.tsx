
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { t } from "@/utils/i18n";
import { useI18n } from "@/context/I18nContext";
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
    name: "pricing.basic",
    price: "199.000",
    period: "pricing.month",
    description: "pricing.basic_desc",
    features: [
      { vi: "10 bài viết mỗi tháng", en: "10 articles per month" },
      { vi: "Tối đa 1.000 từ mỗi bài", en: "Maximum 1,000 words per article" },
      { vi: "Tối ưu SEO cơ bản", en: "Basic SEO optimization" },
      { vi: "Kết nối 1 tài khoản WordPress", en: "Connect 1 WordPress account" },
      { vi: "Hỗ trợ qua email", en: "Email support" }
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
      { vi: "30 bài viết mỗi tháng", en: "30 articles per month" },
      { vi: "Tối đa 2.000 từ mỗi bài", en: "Maximum 2,000 words per article" },
      { vi: "Tối ưu SEO nâng cao", en: "Advanced SEO optimization" },
      { vi: "Kết nối 3 tài khoản mạng xã hội", en: "Connect 3 social media accounts" },
      { vi: "Phân tích nội dung", en: "Content analysis" },
      { vi: "Hỗ trợ ưu tiên", en: "Priority support" }
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
      { vi: "100 bài viết mỗi tháng", en: "100 articles per month" },
      { vi: "Không giới hạn số từ", en: "Unlimited words" },
      { vi: "Tối ưu SEO cao cấp", en: "Premium SEO optimization" },
      { vi: "Kết nối không giới hạn", en: "Unlimited connections" },
      { vi: "Phân tích nội dung chi tiết", en: "Detailed content analysis" },
      { vi: "Hỗ trợ 24/7", en: "24/7 support" },
      { vi: "API tích hợp", en: "API integration" }
    ],
    cta: "pricing.select_enterprise",
    popular: false
  }
];

const Pricing = () => {
  const { locale } = useI18n();
  const [currentLocale, setCurrentLocale] = useState(locale);
  
  // Đảm bảo component được cập nhật khi ngôn ngữ thay đổi
  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);
  
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
                    <span className="text-gray-600">
                      {currentLocale === 'vi' ? feature.vi : feature.en}
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
