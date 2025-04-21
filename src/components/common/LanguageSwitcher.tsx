
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const { toast } = useToast();
  
  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(newLanguage);
    
    toast({
      title: newLanguage === 'en' ? 'Language changed' : 'Đã thay đổi ngôn ngữ',
      description: newLanguage === 'en' ? 'English is now active' : 'Tiếng Việt đã được kích hoạt',
      duration: 2000,
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-1 px-2"
    >
      <Globe size={16} />
      <span>{i18n.language === 'vi' ? 'EN' : 'VI'}</span>
    </Button>
  );
};

export default LanguageSwitcher;
