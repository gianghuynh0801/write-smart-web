
import React from "react";
import { useI18n } from "@/context/I18nContext";
import { Globe } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { t } from "@/utils/i18n";

const languages = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
];

const LanguageSwitcher = () => {
  const { locale, setLang } = useI18n();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="px-2"
          title={locale === "vi" ? "Chuyển ngôn ngữ" : "Switch language"}
          aria-label="Globe icon / Language picker"
        >
          <Globe />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2">
        <div className="flex flex-col gap-1">
          {languages.map((item) => (
            <Button
              key={item.code}
              variant={locale === item.code ? "secondary" : "ghost"}
              className="justify-start w-full"
              onClick={() => setLang(item.code as "vi" | "en")}
            >
              {t(`lang.${item.code}`)}
              {locale === item.code && (
                <span className="ml-1 text-xs text-primary-500">✓</span>
              )}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default LanguageSwitcher;
