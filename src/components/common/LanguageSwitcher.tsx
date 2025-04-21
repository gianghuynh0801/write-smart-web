
import React from "react";
import { useI18n } from "@/context/I18nContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";

const LanguageSwitcher = () => {
  const { locale, setLang } = useI18n();

  return (
    <Button
      variant="ghost"
      className="flex items-center px-2 focus:ring-0"
      onClick={() => setLang(locale === "vi" ? "en" : "vi")}
      title={locale === "vi" ? "Switch to English" : "Chuyển sang Tiếng Việt"}
      aria-label="Chuyển đổi ngôn ngữ"
    >
      <Languages className="w-4 h-4 mr-1" />
      <span className="hidden md:inline">
        {locale === "vi" ? "EN" : "VI"}
      </span>
    </Button>
  );
};

export default LanguageSwitcher;
