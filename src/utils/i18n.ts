
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Vietnamese translations
const resourcesVI = {
  common: {
    features: "Tính năng",
    pricing: "Bảng giá",
    contact: "Liên hệ",
    login: "Đăng nhập",
    register: "Đăng ký",
    registerFree: "Đăng ký miễn phí",
    contactUs: "Liên hệ với chúng tôi",
    tryFree: "Dùng thử miễn phí",
    getStarted: "Bắt đầu ngay",
    noCredit: "Không cần thẻ tín dụng. Bắt đầu với 5 bài viết miễn phí.",
  },
  hero: {
    title: "Tạo bài viết chuẩn SEO với AI",
    description: "Tối ưu nội dung cho website, mạng xã hội, bán hàng tự động",
  },
  features: {
    title: "Tính năng nổi bật",
    description: "Khám phá những công cụ mạnh mẽ giúp bạn tạo nội dung chất lượng một cách dễ dàng",
    feature1: {
      title: "Tạo nội dung nhanh chóng",
      description: "Tạo bài viết chuẩn SEO trong vài phút thay vì hàng giờ viết thủ công",
    },
    feature2: {
      title: "Tối ưu hoá SEO",
      description: "Nội dung được tối ưu hoá cho công cụ tìm kiếm, giúp nâng cao thứ hạng website",
    },
    feature3: {
      title: "Đa nền tảng",
      description: "Tạo nội dung cho website, Facebook, Instagram và nhiều nền tảng khác",
    },
    feature4: {
      title: "Phân tích dữ liệu",
      description: "Theo dõi hiệu suất nội dung và nhận báo cáo chi tiết về tương tác",
    },
    feature5: {
      title: "Đa ngôn ngữ",
      description: "Tạo nội dung bằng nhiều ngôn ngữ khác nhau, phù hợp với đối tượng toàn cầu",
    },
    feature6: {
      title: "Lưu trữ an toàn",
      description: "Dữ liệu được mã hóa và lưu trữ an toàn trên đám mây, truy cập mọi lúc mọi nơi",
    },
  },
  pricing: {
    title: "Bảng giá dịch vụ",
    description: "Lựa chọn gói dịch vụ phù hợp với nhu cầu của bạn",
    mostPopular: "Phổ biến nhất",
    basic: {
      name: "Gói Cơ bản",
      price: "199.000",
      period: "tháng",
      description: "Dành cho người mới bắt đầu",
      cta: "Chọn gói Cơ bản",
      features: [
        "10 bài viết mỗi tháng",
        "Tối đa 1.000 từ mỗi bài",
        "Tối ưu SEO cơ bản",
        "Kết nối 1 tài khoản WordPress",
        "Hỗ trợ qua email",
      ],
    },
    pro: {
      name: "Gói Chuyên nghiệp",
      price: "499.000",
      period: "tháng",
      description: "Dành cho doanh nghiệp nhỏ",
      cta: "Chọn gói Chuyên nghiệp",
      features: [
        "30 bài viết mỗi tháng",
        "Tối đa 2.000 từ mỗi bài",
        "Tối ưu SEO nâng cao",
        "Kết nối 3 tài khoản mạng xã hội",
        "Phân tích nội dung",
        "Hỗ trợ ưu tiên",
      ],
    },
    business: {
      name: "Gói Doanh nghiệp",
      price: "999.000",
      period: "tháng",
      description: "Dành cho doanh nghiệp lớn",
      cta: "Chọn gói Doanh nghiệp",
      features: [
        "100 bài viết mỗi tháng",
        "Không giới hạn số từ",
        "Tối ưu SEO cao cấp",
        "Kết nối không giới hạn",
        "Phân tích nội dung chi tiết",
        "Hỗ trợ 24/7",
        "API tích hợp",
      ],
    },
  },
  testimonials: {
    title: "Khách hàng nói gì về chúng tôi",
    description: "Hàng ngàn người dùng đã tin tưởng và sử dụng WriteSmart để tạo nội dung chất lượng",
  },
  faq: {
    title: "Câu hỏi thường gặp",
    description: "Những thắc mắc phổ biến về dịch vụ WriteSmart",
    questions: [
      {
        question: "WriteSmart hoạt động như thế nào?",
        answer: "WriteSmart sử dụng công nghệ trí tuệ nhân tạo tiên tiến để tạo ra nội dung chất lượng cao. Bạn chỉ cần cung cấp chủ đề, từ khóa và một số thông tin cơ bản, hệ thống sẽ tự động tạo ra bài viết chuẩn SEO cho bạn chỉ trong vài giây.",
      },
      {
        question: "Tôi có thể kết nối WriteSmart với WordPress của mình không?",
        answer: "Có, WriteSmart cho phép bạn kết nối trực tiếp với WordPress thông qua REST API. Bạn chỉ cần nhập URL website, tên người dùng và Application Password, sau đó bạn có thể đăng bài từ WriteSmart lên WordPress của mình một cách dễ dàng.",
      },
      {
        question: "Tôi cần bao nhiêu tín dụng để tạo một bài viết?",
        answer: "Mỗi bài viết tiêu tốn số tín dụng tùy thuộc vào độ dài và mức độ tối ưu SEO. Thông thường, một bài viết dưới 1.000 từ tiêu tốn 1 tín dụng, 1.000-2.000 từ tiêu tốn 2 tín dụng, và bài viết trên 2.000 từ tiêu tốn 3 tín dụng.",
      },
      {
        question: "WriteSmart có hỗ trợ ngôn ngữ nào?",
        answer: "Hiện tại, WriteSmart hỗ trợ tiếng Việt và tiếng Anh. Chúng tôi đang phát triển thêm các ngôn ngữ khác và sẽ cập nhật trong tương lai gần.",
      },
      {
        question: "Làm thế nào để mua thêm tín dụng?",
        answer: "Bạn có thể mua thêm tín dụng thông qua trang 'Tín dụng' trong bảng điều khiển của mình. Chúng tôi hỗ trợ thanh toán qua nhiều phương thức như thẻ tín dụng, Momo, VNPAY và chuyển khoản ngân hàng.",
      },
      {
        question: "Tôi có thể yêu cầu tính năng mới không?",
        answer: "Chắc chắn rồi! Chúng tôi luôn lắng nghe phản hồi từ người dùng. Bạn có thể gửi yêu cầu tính năng mới thông qua trang 'Liên hệ' hoặc gửi email trực tiếp đến support@writesmart.vn.",
      },
    ],
  },
  cta: {
    title: "Tạo nội dung chất lượng ngay hôm nay",
    description: "Đăng ký miễn phí và bắt đầu tạo nội dung chất lượng cho website, mạng xã hội của bạn",
  },
  contact: {
    title: "Liên hệ với chúng tôi",
    description: "Hãy liên hệ với chúng tôi nếu bạn có bất kỳ câu hỏi nào về dịch vụ của chúng tôi",
    form: {
      name: "Họ và tên",
      email: "Email",
      phone: "Số điện thoại",
      message: "Tin nhắn",
      placeholder: {
        name: "Nhập họ và tên của bạn",
        email: "example@email.com",
        phone: "0912345678",
        message: "Nhập tin nhắn của bạn",
      },
      button: "Gửi tin nhắn",
      toast: {
        title: "Đã nhận thông tin",
        description: "Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
      },
    },
    info: {
      title: "Thông tin liên hệ",
      email: "Email",
      phone: "Số điện thoại",
      workingHours: "Giờ làm việc",
      workingDays: {
        weekdays: "Thứ 2 - Thứ 6: 8:00 - 17:30",
        saturday: "Thứ 7: 8:00 - 12:00",
        sunday: "Chủ nhật: Nghỉ",
      },
    },
  },
};

// English translations
const resourcesEN = {
  common: {
    features: "Features",
    pricing: "Pricing",
    contact: "Contact",
    login: "Log in",
    register: "Sign up",
    registerFree: "Sign up for free",
    contactUs: "Contact us",
    tryFree: "Try for free",
    getStarted: "Get started",
    noCredit: "No credit card required. Start with 5 free articles.",
  },
  hero: {
    title: "Create SEO-optimized content with AI",
    description: "Optimize content for websites, social media, and automated sales",
  },
  features: {
    title: "Key Features",
    description: "Discover powerful tools to help you create quality content easily",
    feature1: {
      title: "Fast Content Creation",
      description: "Create SEO-optimized articles in minutes instead of hours of manual writing",
    },
    feature2: {
      title: "SEO Optimization",
      description: "Content optimized for search engines, helping to improve website rankings",
    },
    feature3: {
      title: "Multi-platform",
      description: "Create content for websites, Facebook, Instagram and many other platforms",
    },
    feature4: {
      title: "Data Analysis",
      description: "Track content performance and receive detailed interaction reports",
    },
    feature5: {
      title: "Multilingual",
      description: "Create content in multiple languages, suitable for global audiences",
    },
    feature6: {
      title: "Secure Storage",
      description: "Data is encrypted and stored securely in the cloud, accessible anytime, anywhere",
    },
  },
  pricing: {
    title: "Pricing Plans",
    description: "Choose a service package that suits your needs",
    mostPopular: "Most Popular",
    basic: {
      name: "Basic Package",
      price: "199,000",
      period: "month",
      description: "For beginners",
      cta: "Choose Basic",
      features: [
        "10 articles per month",
        "Maximum 1,000 words per article",
        "Basic SEO optimization",
        "Connect 1 WordPress account",
        "Email support",
      ],
    },
    pro: {
      name: "Professional Package",
      price: "499,000",
      period: "month",
      description: "For small businesses",
      cta: "Choose Professional",
      features: [
        "30 articles per month",
        "Maximum 2,000 words per article",
        "Advanced SEO optimization",
        "Connect 3 social media accounts",
        "Content analysis",
        "Priority support",
      ],
    },
    business: {
      name: "Enterprise Package",
      price: "999,000",
      period: "month",
      description: "For large businesses",
      cta: "Choose Enterprise",
      features: [
        "100 articles per month",
        "Unlimited words",
        "Premium SEO optimization",
        "Unlimited connections",
        "Detailed content analysis",
        "24/7 support",
        "API integration",
      ],
    },
  },
  testimonials: {
    title: "What our customers say",
    description: "Thousands of users have trusted and used WriteSmart to create quality content",
  },
  faq: {
    title: "Frequently Asked Questions",
    description: "Common questions about WriteSmart services",
    questions: [
      {
        question: "How does WriteSmart work?",
        answer: "WriteSmart uses advanced artificial intelligence technology to create high-quality content. You just need to provide the topic, keywords and some basic information, and the system will automatically create SEO-standard articles for you in just seconds.",
      },
      {
        question: "Can I connect WriteSmart with my WordPress?",
        answer: "Yes, WriteSmart allows you to connect directly to WordPress via REST API. You just need to enter your website URL, username and Application Password, then you can easily publish from WriteSmart to your WordPress.",
      },
      {
        question: "How many credits do I need to create an article?",
        answer: "Each article consumes a number of credits depending on length and SEO optimization level. Typically, an article under 1,000 words consumes 1 credit, 1,000-2,000 words consumes 2 credits, and articles over 2,000 words consume 3 credits.",
      },
      {
        question: "What languages does WriteSmart support?",
        answer: "Currently, WriteSmart supports Vietnamese and English. We are developing more languages and will update in the near future.",
      },
      {
        question: "How do I purchase more credits?",
        answer: "You can purchase more credits through the 'Credits' page in your dashboard. We support payment through multiple methods such as credit cards, Momo, VNPAY and bank transfers.",
      },
      {
        question: "Can I request new features?",
        answer: "Absolutely! We always listen to feedback from users. You can submit new feature requests through the 'Contact' page or email directly to support@writesmart.vn.",
      },
    ],
  },
  cta: {
    title: "Create quality content today",
    description: "Sign up for free and start creating quality content for your website and social media",
  },
  contact: {
    title: "Contact Us",
    description: "Contact us if you have any questions about our services",
    form: {
      name: "Full Name",
      email: "Email",
      phone: "Phone Number",
      message: "Message",
      placeholder: {
        name: "Enter your full name",
        email: "example@email.com",
        phone: "0912345678",
        message: "Enter your message",
      },
      button: "Send Message",
      toast: {
        title: "Information received",
        description: "We will contact you as soon as possible.",
      },
    },
    info: {
      title: "Contact Information",
      email: "Email",
      phone: "Phone Number",
      workingHours: "Working Hours",
      workingDays: {
        weekdays: "Monday - Friday: 8:00 - 17:30",
        saturday: "Saturday: 8:00 - 12:00",
        sunday: "Sunday: Closed",
      },
    },
  },
};

// Initialize i18n
i18n
  .use(initReactI18next)
  .init({
    resources: {
      vi: resourcesVI,
      en: resourcesEN,
    },
    lng: 'vi', // Default language
    fallbackLng: 'vi',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

export default i18n;
