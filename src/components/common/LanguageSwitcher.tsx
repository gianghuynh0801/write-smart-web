
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { changeLanguage } from "@/utils/languageService";

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation();
  const { toast } = useToast();
  
  const handleLanguageChange = (lang: 'vi' | 'en') => {
    changeLanguage(lang);
    
    toast({
      title: lang === 'en' ? 'Language changed' : 'Đã thay đổi ngôn ngữ',
      description: lang === 'en' ? 'English is now active' : 'Tiếng Việt đã được kích hoạt',
      duration: 2000,
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 px-2"
        >
          <Globe size={16} />
          <span>{i18n.language === 'vi' ? 'VI' : 'EN'}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-0">
        <div className="flex flex-col">
          <Button
            variant="ghost"
            onClick={() => handleLanguageChange('vi')}
            className={`justify-start rounded-none px-4 py-2 text-sm ${i18n.language === 'vi' ? 'bg-gray-100' : ''}`}
          >
            Tiếng Việt
          </Button>
          <Button
            variant="ghost"
            onClick={() => handleLanguageChange('en')}
            className={`justify-start rounded-none px-4 py-2 text-sm ${i18n.language === 'en' ? 'bg-gray-100' : ''}`}
          >
            English
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;
