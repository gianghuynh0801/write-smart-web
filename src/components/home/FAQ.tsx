
import { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "WriteSmart hoạt động như thế nào?",
    answer: "WriteSmart sử dụng công nghệ trí tuệ nhân tạo tiên tiến để tạo ra nội dung chất lượng cao. Bạn chỉ cần cung cấp chủ đề, từ khóa và một số thông tin cơ bản, hệ thống sẽ tự động tạo ra bài viết chuẩn SEO cho bạn chỉ trong vài giây."
  },
  {
    question: "Tôi có thể kết nối WriteSmart với WordPress của mình không?",
    answer: "Có, WriteSmart cho phép bạn kết nối trực tiếp với WordPress thông qua REST API. Bạn chỉ cần nhập URL website, tên người dùng và Application Password, sau đó bạn có thể đăng bài từ WriteSmart lên WordPress của mình một cách dễ dàng."
  },
  {
    question: "Tôi cần bao nhiêu tín dụng để tạo một bài viết?",
    answer: "Mỗi bài viết tiêu tốn số tín dụng tùy thuộc vào độ dài và mức độ tối ưu SEO. Thông thường, một bài viết dưới 1.000 từ tiêu tốn 1 tín dụng, 1.000-2.000 từ tiêu tốn 2 tín dụng, và bài viết trên 2.000 từ tiêu tốn 3 tín dụng."
  },
  {
    question: "WriteSmart có hỗ trợ ngôn ngữ nào?",
    answer: "Hiện tại, WriteSmart hỗ trợ tiếng Việt và tiếng Anh. Chúng tôi đang phát triển thêm các ngôn ngữ khác và sẽ cập nhật trong tương lai gần."
  },
  {
    question: "Làm thế nào để mua thêm tín dụng?",
    answer: "Bạn có thể mua thêm tín dụng thông qua trang 'Tín dụng' trong bảng điều khiển của mình. Chúng tôi hỗ trợ thanh toán qua nhiều phương thức như thẻ tín dụng, Momo, VNPAY và chuyển khoản ngân hàng."
  },
  {
    question: "Tôi có thể yêu cầu tính năng mới không?",
    answer: "Chắc chắn rồi! Chúng tôi luôn lắng nghe phản hồi từ người dùng. Bạn có thể gửi yêu cầu tính năng mới thông qua trang 'Liên hệ' hoặc gửi email trực tiếp đến support@writesmart.vn."
  }
];

const FAQ = () => {
  return (
    <div className="container py-16">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h2 className="text-3xl font-bold mb-4">Câu hỏi thường gặp</h2>
        <p className="text-gray-600 text-lg">
          Những thắc mắc phổ biến về dịch vụ WriteSmart
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
