
// Utility for i18n support
// This is a simple implementation and in a real app you would use a library like i18next

type Locale = 'vi' | 'en';

interface Translations {
  [key: string]: {
    [locale in Locale]: string;
  };
}

const translations: Translations = {
  // Common
  'app.name': {
    vi: 'WriteSmart',
    en: 'WriteSmart'
  },
  'app.description': {
    vi: 'Tạo nội dung chuẩn SEO tự động với AI',
    en: 'Create SEO-optimized content automatically with AI'
  },
  
  // Navigation
  'nav.home': {
    vi: 'Trang chủ',
    en: 'Home'
  },
  'nav.pricing': {
    vi: 'Bảng giá',
    en: 'Pricing'
  },
  'nav.features': {
    vi: 'Tính năng',
    en: 'Features'
  },
  'nav.login': {
    vi: 'Đăng nhập',
    en: 'Login'
  },
  'nav.register': {
    vi: 'Đăng ký',
    en: 'Register'
  },
  
  // Dashboard
  'dashboard.overview': {
    vi: 'Tổng quan',
    en: 'Overview'
  },
  'dashboard.create': {
    vi: 'Tạo nội dung',
    en: 'Create Content'
  },
  'dashboard.credits': {
    vi: 'Tín dụng',
    en: 'Credits'
  },
  'dashboard.subscriptions': {
    vi: 'Gói đăng ký',
    en: 'Subscriptions'
  }
  
  // Add more translations as needed
};

let currentLocale: Locale = 'vi';

export const setLocale = (locale: Locale) => {
  currentLocale = locale;
};

export const getLocale = (): Locale => {
  return currentLocale;
};

export const translate = (key: string, placeholders?: Record<string, string>): string => {
  if (!translations[key]) {
    console.warn(`Translation missing for key: ${key}`);
    return key;
  }
  
  let text = translations[key][currentLocale] || translations[key]['vi'];
  
  if (placeholders) {
    Object.entries(placeholders).forEach(([placeholder, value]) => {
      text = text.replace(`{{${placeholder}}}`, value);
    });
  }
  
  return text;
};

export const t = translate;

// Initialize with browser language
export const initializeI18n = () => {
  const browserLang = navigator.language.substring(0, 2);
  if (browserLang === 'en') {
    setLocale('en');
  } else {
    setLocale('vi');
  }
};
