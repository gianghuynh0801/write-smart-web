
import { useTranslation } from "react-i18next";
import { 
  Sparkles, 
  Rocket, 
  Zap, 
  BarChart3, 
  Clock, 
  Shield 
} from "lucide-react";

// Xác định cấu trúc các feature với icon tương ứng
const featureIcons = [
  { index: 1, icon: Sparkles },
  { index: 2, icon: Rocket },
  { index: 3, icon: Zap },
  { index: 4, icon: BarChart3 },
  { index: 5, icon: Clock },
  { index: 6, icon: Shield },
];

const Features = () => {
  const { t } = useTranslation('features');
  
  return (
    <div id="features" className="bg-gray-50 py-16 animate-fade-in">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
          <p className="text-gray-600 text-lg">
            {t('description')}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureIcons.map(({ index, icon: Icon }) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow hover-scale animate-fade-in"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Icon size={24} />
              </div>
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
