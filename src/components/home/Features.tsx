
import { Check } from "lucide-react";
import { t } from "@/utils/i18n";

const features = [
  {
    title: "features.instant_content",
    description: "features.instant_content_desc",
    icon: "⚡"
  },
  {
    title: "features.seo_optimization",
    description: "features.seo_optimization_desc",
    icon: "🔍"
  },
  {
    title: "features.cross_platform",
    description: "features.cross_platform_desc",
    icon: "🌐"
  },
  {
    title: "features.data_analysis",
    description: "features.data_analysis_desc",
    icon: "📊"
  },
  {
    title: "features.multilingual",
    description: "features.multilingual_desc",
    icon: "🔤"
  },
  {
    title: "features.secure_storage",
    description: "features.secure_storage_desc",
    icon: "🔒"
  }
];

const Features = () => {
  return (
    <div id="features" className="bg-gray-50 py-16">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("features.title")}</h2>
          <p className="text-gray-600 text-lg">
            {t("features.description")}
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{t(feature.title)}</h3>
              <p className="text-gray-600">{t(feature.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
