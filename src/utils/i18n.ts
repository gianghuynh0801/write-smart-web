
type Locale = 'vi' | 'en';

interface Translations {
  [key: string]: {
    [locale in Locale]: string;
  };
}

// Chú ý: key nào có tiếng Việt thì phải có tiếng Anh tương ứng!
const translations: Translations = {
  // Common
  'app.name': { vi: 'WriteSmart', en: 'WriteSmart' },
  'app.description': {
    vi: 'Tạo nội dung chuẩn SEO tự động với AI',
    en: 'Create SEO-optimized content automatically with AI'
  },

  // Navigation
  'nav.home': { vi: 'Trang chủ', en: 'Home' },
  'nav.pricing': { vi: 'Bảng giá', en: 'Pricing' },
  'nav.features': { vi: 'Tính năng', en: 'Features' },
  'nav.contact': { vi: 'Liên hệ', en: 'Contact' },
  'nav.login': { vi: 'Đăng nhập', en: 'Login' },
  'nav.register': { vi: 'Đăng ký', en: 'Register' },

  // Landing/Hero section (nếu có)
  'hero.heading': {
    vi: "Tạo bài viết chuẩn SEO với AI",
    en: "Create SEO-optimized articles with AI"
  },
  'hero.subheading': {
    vi: "Tối ưu nội dung cho website, mạng xã hội, bán hàng tự động",
    en: "Optimize content for websites, social media, and auto sales"
  },
  'hero.cta_get_started': {
    vi: "Bắt đầu ngay",
    en: "Get started"
  },
  'hero.cta_try_now': {
    vi: "Dùng thử miễn phí",
    en: "Try for free"
  },
  // Features section
  'features.title': {
    vi: "Tính năng nổi bật",
    en: "Outstanding Features",
  },
  // ... (Add các key cần thiết cho Features, Pricing, Testimonials, FAQ, Contact, CTA...)

  // Dashboard (giữ nguyên)
  'dashboard.overview': { vi: 'Tổng quan', en: 'Overview' },
  'dashboard.create': { vi: 'Tạo nội dung', en: 'Create Content' },
  'dashboard.credits': { vi: 'Tín dụng', en: 'Credits' },
  'dashboard.subscriptions': { vi: 'Gói đăng ký', en: 'Subscriptions' },

  // Thông báo Language 
  'lang.vi': { vi: "Tiếng Việt", en: "Vietnamese" },
  'lang.en': { vi: "Tiếng Anh", en: "English" },
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
