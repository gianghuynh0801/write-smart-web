
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Pricing = () => {
  const { t } = useTranslation('pricing');
  
  const plans = ['basic', 'pro', 'business'];
  
  return (
    <div id="pricing" className="container py-16 animate-fade-in">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
        <p className="text-gray-600 text-lg">
          {t('description')}
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan, index) => {
          const isPopular = plan === 'pro';
          return (
            <div 
              key={index} 
              className={`bg-white rounded-lg border ${
                isPopular ? 'border-primary shadow-lg' : 'border-gray-200'
              } overflow-hidden hover-scale animate-fade-in`}
              style={{ animationDelay: `${index * 120}ms`, animationFillMode: "both" }}
            >
              {isPopular && (
                <div className="bg-primary text-white text-center py-1.5 text-sm font-medium">
                  {t('mostPopular')}
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">{t(`${plan}.name`)}</h3>
                <p className="text-gray-500 mb-4">{t(`${plan}.description`)}</p>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{t(`${plan}.price`)}đ</span>
                  <span className="text-gray-500">/{t(`${plan}.period`)}</span>
                </div>
                <Link to="/register">
                  <Button 
                    className={`w-full ${!isPopular && 'bg-gray-800 hover:bg-gray-700'}`}
                  >
                    {t(`${plan}.cta`)}
                  </Button>
                </Link>
                <div className="mt-6 space-y-3">
                  {Array.from({ length: plan === 'basic' ? 5 : plan === 'pro' ? 6 : 7 }).map((_, i) => (
                    <div key={i} className="flex items-center">
                      <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                      <span className="text-gray-600">
                        {t(`${plan}.features.${i}`)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Pricing;
