
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

const features = [1, 2, 3, 4, 5, 6]; // feature indices

const Features = () => {
  const { t } = useTranslation('features');
  
  return (
    <div id="features" className="bg-gray-50 py-16">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
          <p className="text-gray-600 text-lg">
            {t('description')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{t(`feature${index}.icon`, { defaultValue: "🔍" })}</div>
              <h3 className="text-xl font-bold mb-2">{t(`feature${index}.title`)}</h3>
              <p className="text-gray-600">{t(`feature${index}.description`)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
