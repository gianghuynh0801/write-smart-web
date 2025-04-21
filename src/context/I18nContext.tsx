
import React, { createContext, useContext, useState, useEffect } from "react";
import { getLocale, setLocale, initializeI18n } from "@/utils/i18n";

type I18nContextType = {
  locale: "vi" | "en";
  setLang: (lang: "vi" | "en") => void;
};

const I18nContext = createContext<I18nContextType>({
  locale: "vi",
  setLang: () => {},
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<"vi" | "en">(getLocale());

  const setLang = (lang: "vi" | "en") => {
    setLocale(lang);
    setLocaleState(lang);
    // lưu vào localStorage để nhớ lựa chọn của user
    localStorage.setItem("writesmart_language", lang);
  };

  useEffect(() => {
    // Khởi tạo i18n theo ngôn ngữ trình duyệt hoặc từ localStorage
    const storedLang = localStorage.getItem("writesmart_language");
    if (storedLang === "vi" || storedLang === "en") {
      setLang(storedLang);
    } else {
      initializeI18n();
      setLocaleState(getLocale());
    }
    // eslint-disable-next-line
  }, []);

  return (
    <I18nContext.Provider value={{ locale, setLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
