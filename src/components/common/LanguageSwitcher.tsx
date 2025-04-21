
import React from "react";
import { useI18n } from "@/context/I18nContext";
import { Globe } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { t } from "@/utils/i18n";
import { useToast } from "@/components/ui/use-toast";

const languages = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
];

const LanguageSwitcher = () => {
  const { locale, setLang } = useI18n();
  const { toast } = useToast();
  
  const handleLanguageChange = (lang: "vi" | "en") => {
    if (lang === locale) return;
    
    setLang(lang);
    toast({
      title: lang === "vi" ? "Đã chuyển sang Tiếng Việt" : "Switched to English",
      description: lang === "vi" ? "Ngôn ngữ hiển thị đã được thay đổi" : "Display language has been changed",
      duration: 3000,
    });
    
    console.log(`Language changed to: ${lang}`);
    
    // Force a page reload to ensure all components update
    window.location.reload();
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="px-2"
          title={locale === "vi" ? "Chuyển ngôn ngữ" : "Switch language"}
          aria-label="Language selector"
        >
          <Globe className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {languages.map((item) => (
          <DropdownMenuItem
            key={item.code}
            className={`${locale === item.code ? "bg-secondary" : ""} cursor-pointer`}
            onClick={() => handleLanguageChange(item.code as "vi" | "en")}
          >
            <span className="flex items-center">
              {item.label}
              {locale === item.code && (
                <span className="ml-auto text-primary">✓</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
