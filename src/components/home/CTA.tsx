
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CTA = () => {
  const { t } = useTranslation(['common', 'cta']);
  
  return (
    <div className="bg-primary py-16">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('cta:title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {t('cta:description')}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
                {t('common:registerFree')}
              </Button>
            </Link>
            <Link to="/contact">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-violet-600 w-full sm:w-auto border-2"
              >
                {t('common:contactUs')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;

