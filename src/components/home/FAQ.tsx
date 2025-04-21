
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useI18n } from "@/context/I18nContext";
import { t } from "@/utils/i18n";

interface FAQItem {
  questionVI: string;
  questionEN: string;
  answerVI: string;
  answerEN: string;
}

const faqs: FAQItem[] = [
  {
    questionVI: "WriteSmart hoạt động như thế nào?",
    questionEN: "How does WriteSmart work?",
    answerVI: "WriteSmart sử dụng công nghệ trí tuệ nhân tạo tiên tiến để tạo ra nội dung chất lượng cao. Bạn chỉ cần cung cấp chủ đề, từ khóa và một số thông tin cơ bản, hệ thống sẽ tự động tạo ra bài viết chuẩn SEO cho bạn chỉ trong vài giây.",
    answerEN: "WriteSmart uses advanced artificial intelligence technology to create high-quality content. You just need to provide the topic, keywords, and some basic information, and the system will automatically generate SEO-optimized articles for you in just seconds."
  },
  {
    questionVI: "Tôi có thể kết nối WriteSmart với WordPress của mình không?",
    questionEN: "Can I connect WriteSmart with my WordPress?",
    answerVI: "Có, WriteSmart cho phép bạn kết nối trực tiếp với WordPress thông qua REST API. Bạn chỉ cần nhập URL website, tên người dùng và Application Password, sau đó bạn có thể đăng bài từ WriteSmart lên WordPress của mình một cách dễ dàng.",
    answerEN: "Yes, WriteSmart allows you to connect directly to WordPress through REST API. You just need to enter your website URL, username, and Application Password, then you can easily post articles from WriteSmart to your WordPress."
  },
  {
    questionVI: "Tôi cần bao nhiêu tín dụng để tạo một bài viết?",
    questionEN: "How many credits do I need to create an article?",
    answerVI: "Mỗi bài viết tiêu tốn số tín dụng tùy thuộc vào độ dài và mức độ tối ưu SEO. Thông thường, một bài viết dưới 1.000 từ tiêu tốn 1 tín dụng, 1.000-2.000 từ tiêu tốn 2 tín dụng, và bài viết trên 2.000 từ tiêu tốn 3 tín dụng.",
    answerEN: "Each article consumes credits depending on its length and level of SEO optimization. Typically, an article under 1,000 words consumes 1 credit, 1,000-2,000 words consumes 2 credits, and articles over 2,000 words consume 3 credits."
  },
  {
    questionVI: "WriteSmart có hỗ trợ ngôn ngữ nào?",
    questionEN: "What languages does WriteSmart support?",
    answerVI: "Hiện tại, WriteSmart hỗ trợ tiếng Việt và tiếng Anh. Chúng tôi đang phát triển thêm các ngôn ngữ khác và sẽ cập nhật trong tương lai gần.",
    answerEN: "Currently, WriteSmart supports Vietnamese and English. We are developing additional languages and will update in the near future."
  },
  {
    questionVI: "Làm thế nào để mua thêm tín dụng?",
    questionEN: "How do I buy more credits?",
    answerVI: "Bạn có thể mua thêm tín dụng thông qua trang 'Tín dụng' trong bảng điều khiển của mình. Chúng tôi hỗ trợ thanh toán qua nhiều phương thức như thẻ tín dụng, Momo, VNPAY và chuyển khoản ngân hàng.",
    answerEN: "You can buy more credits through the 'Credits' page in your dashboard. We support payment through multiple methods such as credit cards, Momo, VNPAY, and bank transfers."
  },
  {
    questionVI: "Tôi có thể yêu cầu tính năng mới không?",
    questionEN: "Can I request new features?",
    answerVI: "Chắc chắn rồi! Chúng tôi luôn lắng nghe phản hồi từ người dùng. Bạn có thể gửi yêu cầu tính năng mới thông qua trang 'Liên hệ' hoặc gửi email trực tiếp đến support@writesmart.vn.",
    answerEN: "Absolutely! We always listen to feedback from users. You can send new feature requests through the 'Contact' page or email directly to support@writesmart.vn."
  }
];

const FAQ = () => {
  const { locale } = useI18n();
  
  return (
    <div className="container py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">{t("faq.title")}</h2>
        <p className="text-gray-600 text-lg">
          {t("faq.description")}
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {locale === "vi" ? faq.questionVI : faq.questionEN}
              </AccordionTrigger>
              <AccordionContent>
                {locale === "vi" ? faq.answerVI : faq.answerEN}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
