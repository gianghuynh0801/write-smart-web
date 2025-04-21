
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Hero = () => {
  const { t } = useTranslation(['common', 'hero']);
  
  return (
    <div className="container py-16 md:py-24">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            {t('hero:title')}
          </h1>
          <p className="text-xl text-gray-600">
            {t('hero:description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                {t('common:tryFree')}
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t('common:getStarted')}
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500">
            {t('common:noCredit')}
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
