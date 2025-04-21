
import React, { createContext, useContext, useState, useEffect } from "react";
import { getLocale, setLocale, initializeI18n } from "@/utils/i18n";
import { LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

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

  useEffect(() => {
    // Initialize i18n based on browser language or localStorage
    initializeI18n();
    const storedLang = localStorage.getItem(LOCAL_STORAGE_KEYS.LANGUAGE);
    if (storedLang === "vi" || storedLang === "en") {
      setLang(storedLang);
    } else {
      // Default to Vietnamese if no preference is stored
      setLang("vi");
    }
    // eslint-disable-next-line
  }, []);

  const setLang = (lang: "vi" | "en") => {
    setLocale(lang);
    setLocaleState(lang);
    // Store in localStorage to remember user's choice
    localStorage.setItem(LOCAL_STORAGE_KEYS.LANGUAGE, lang);
  };

  return (
    <I18nContext.Provider value={{ locale, setLang }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
