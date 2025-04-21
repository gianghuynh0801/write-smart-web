type Locale = 'vi' | 'en';

interface Translations {
  [key: string]: {
    [locale in Locale]: string;
  };
}

// All translations must have both Vietnamese and English versions!
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

  // Landing/Hero section
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
  'hero.no_credit_card': {
    vi: "Không cần thẻ tín dụng. Bắt đầu với 5 bài viết miễn phí.",
    en: "No credit card required. Start with 5 free articles."
  },

  // Features section
  'features.title': {
    vi: "Tính năng nổi bật",
    en: "Outstanding Features",
  },
  'features.description': {
    vi: "WriteSmart cung cấp đầy đủ công cụ để tạo và quản lý nội dung SEO chất lượng cao",
    en: "WriteSmart provides all the tools to create and manage high-quality SEO content"
  },
  'features.instant_content': {
    vi: "Tạo nội dung tức thì",
    en: "Instant Content Creation"
  },
  'features.instant_content_desc': {
    vi: "Tạo bài viết chỉ trong vài giây với công nghệ AI tiên tiến",
    en: "Create articles in seconds with advanced AI technology"
  },
  'features.seo_optimization': {
    vi: "Tối ưu hóa SEO",
    en: "SEO Optimization"
  },
  'features.seo_optimization_desc': {
    vi: "Mọi bài viết đều được tối ưu tự động cho các công cụ tìm kiếm",
    en: "All articles are automatically optimized for search engines"
  },
  'features.cross_platform': {
    vi: "Đa nền tảng",
    en: "Cross-platform"
  },
  'features.cross_platform_desc': {
    vi: "Đăng bài trực tiếp lên WordPress, Facebook, TikTok và nhiều nền tảng khác",
    en: "Post directly to WordPress, Facebook, TikTok and many other platforms"
  },
  'features.data_analysis': {
    vi: "Phân tích dữ liệu",
    en: "Data Analysis"
  },
  'features.data_analysis_desc': {
    vi: "Báo cáo chi tiết về hiệu suất nội dung và đề xuất cải thiện",
    en: "Detailed reports on content performance and improvement suggestions"
  },
  'features.multilingual': {
    vi: "Hỗ trợ đa ngôn ngữ",
    en: "Multilingual Support"
  },
  'features.multilingual_desc': {
    vi: "Tạo nội dung bằng tiếng Việt và tiếng Anh với chất lượng cao",
    en: "Create high-quality content in Vietnamese and English"
  },
  'features.secure_storage': {
    vi: "Lưu trữ an toàn",
    en: "Secure Storage"
  },
  'features.secure_storage_desc': {
    vi: "Tất cả bài viết được lưu trữ an toàn và dễ dàng truy cập bất cứ khi nào",
    en: "All articles are securely stored and easily accessible anytime"
  },

  // Pricing
  'pricing.title': {
    vi: "Bảng giá dịch vụ",
    en: "Pricing"
  },
  'pricing.description': {
    vi: "Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn",
    en: "Choose a service package that suits your needs"
  },
  'pricing.basic': {
    vi: "Gói Cơ bản",
    en: "Basic Package"
  },
  'pricing.basic_desc': {
    vi: "Dành cho người mới bắt đầu",
    en: "For beginners"
  },
  'pricing.professional': {
    vi: "Gói Chuyên nghiệp",
    en: "Professional Package"
  },
  'pricing.professional_desc': {
    vi: "Dành cho doanh nghiệp nhỏ",
    en: "For small businesses"
  },
  'pricing.enterprise': {
    vi: "Gói Doanh nghiệp",
    en: "Enterprise Package"
  },
  'pricing.enterprise_desc': {
    vi: "Dành cho doanh nghiệp lớn",
    en: "For large businesses"
  },
  'pricing.month': {
    vi: "tháng",
    en: "month"
  },
  'pricing.most_popular': {
    vi: "Phổ biến nhất",
    en: "Most popular"
  },
  'pricing.select_basic': {
    vi: "Chọn gói Cơ bản",
    en: "Select Basic Package"
  },
  'pricing.select_professional': {
    vi: "Chọn gói Chuyên nghiệp",
    en: "Select Professional Package"
  },
  'pricing.select_enterprise': {
    vi: "Chọn gói Doanh nghiệp",
    en: "Select Enterprise Package"
  },

  // Testimonials
  'testimonials.title': {
    vi: "Khách hàng nói gì về chúng tôi",
    en: "What our customers say about us"
  },
  'testimonials.description': {
    vi: "Hàng ngàn người dùng đã tin tưởng và sử dụng WriteSmart để tạo nội dung chất lượng",
    en: "Thousands of users trust and use WriteSmart to create quality content"
  },

  // FAQ
  'faq.title': {
    vi: "Câu hỏi thường gặp",
    en: "Frequently Asked Questions"
  },
  'faq.description': {
    vi: "Những thắc mắc phổ biến về dịch vụ WriteSmart",
    en: "Common questions about WriteSmart services"
  },

  // Contact
  'contact.title': {
    vi: "Liên hệ với chúng tôi",
    en: "Contact us"
  },
  'contact.description': {
    vi: "Bạn có câu hỏi hoặc cần tư vấn? Hãy liên hệ với chúng tôi ngay hôm nay!",
    en: "Do you have questions or need advice? Contact us today!"
  },
  'contact.send_message': {
    vi: "Gửi tin nhắn",
    en: "Send message"
  },
  'contact.full_name': {
    vi: "Họ và tên",
    en: "Full name"
  },
  'contact.email': {
    vi: "Email",
    en: "Email"
  },
  'contact.phone': {
    vi: "Số điện thoại",
    en: "Phone number"
  },
  'contact.message': {
    vi: "Tin nhắn",
    en: "Message"
  },
  'contact.enter_name': {
    vi: "Nhập họ và tên của bạn",
    en: "Enter your full name"
  },
  'contact.enter_message': {
    vi: "Nhập nội dung tin nhắn của bạn",
    en: "Enter your message"
  },
  'contact.contact_info': {
    vi: "Thông tin liên hệ",
    en: "Contact information"
  },
  'contact.working_hours': {
    vi: "Giờ làm việc",
    en: "Working hours"
  },
  'contact.monday_friday': {
    vi: "Thứ Hai - Thứ Sáu: 8:30 - 17:30",
    en: "Monday - Friday: 8:30 - 17:30"
  },
  'contact.saturday': {
    vi: "Thứ Bảy: 8:30 - 12:00",
    en: "Saturday: 8:30 - 12:00"
  },
  'contact.sunday': {
    vi: "Chủ Nhật: Nghỉ",
    en: "Sunday: Closed"
  },

  // CTA
  'cta.heading': {
    vi: "Sẵn sàng tạo nội dung tuyệt vời với AI?",
    en: "Ready to create amazing content with AI?"
  },
  'cta.subheading': {
    vi: "Đăng ký ngay hôm nay và nhận 5 bài viết miễn phí để trải nghiệm sức mạnh của WriteSmart",
    en: "Sign up today and get 5 free articles to experience the power of WriteSmart"
  },
  'cta.register_free': {
    vi: "Đăng ký miễn phí",
    en: "Register for free"
  },
  'cta.contact_us': {
    vi: "Liên hệ tư vấn",
    en: "Contact for consultation"
  },

  // Dashboard
  'dashboard.overview': { vi: 'Tổng quan', en: 'Overview' },
  'dashboard.create': { vi: 'Tạo nội dung', en: 'Create Content' },
  'dashboard.credits': { vi: 'Tín dụng', en: 'Credits' },
  'dashboard.subscriptions': { vi: 'Gói đăng ký', en: 'Subscriptions' },

  // Language notification
  'lang.vi': { vi: "Tiếng Việt", en: "Vietnamese" },
  'lang.en': { vi: "Tiếng Anh", en: "English" },
};

// Default to Vietnamese
let currentLocale: Locale = 'vi';

export const setLocale = (locale: Locale) => {
  currentLocale = locale;
  console.log(`Locale set to: ${locale}`);
};

export const getLocale = (): Locale => {
  const storedLang = localStorage.getItem('writesmart_language');
  if (storedLang === 'en') {
    return 'en';
  }
  return 'vi';
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

// Initialize with browser language or stored preference
export const initializeI18n = () => {
  const storedLang = localStorage.getItem('writesmart_language');
  if (storedLang === 'en') {
    setLocale('en');
    currentLocale = 'en';
  } else {
    // Default to Vietnamese
    setLocale('vi');
    currentLocale = 'vi';
  }
  console.log("I18n initialized with locale:", currentLocale);
};
