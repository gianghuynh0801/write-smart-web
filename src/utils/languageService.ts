
import { LOCAL_STORAGE_KEYS, getItem, setItem } from './localStorageService';
import i18n from './i18n';

// Key for storing language preference
const LANG_KEY = LOCAL_STORAGE_KEYS.LANGUAGE;

/**
 * Initialize language from localStorage or default to Vietnamese
 */
export const initLanguage = (): void => {
  const savedLanguage = getItem<string>(LANG_KEY, false) || 'vi';
  i18n.changeLanguage(savedLanguage);
};

/**
 * Change the application language
 * @param lang Language code ('vi' or 'en')
 */
export const changeLanguage = (lang: 'vi' | 'en'): void => {
  i18n.changeLanguage(lang);
  setItem(LANG_KEY, lang);
};

/**
 * Get the current language
 * @returns Current language code
 */
export const getCurrentLanguage = (): string => {
  return i18n.language || 'vi';
};

/**
 * Check if the language is Vietnamese
 * @returns True if language is Vietnamese
 */
export const isVietnamese = (): boolean => {
  return getCurrentLanguage().startsWith('vi');
};

/**
 * Check if the language is English
 * @returns True if language is English
 */
export const isEnglish = (): boolean => {
  return getCurrentLanguage().startsWith('en');
};
