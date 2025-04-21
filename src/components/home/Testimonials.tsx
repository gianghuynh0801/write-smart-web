
import { Star } from "lucide-react";
import { useI18n } from "@/context/I18nContext";
import { t } from "@/utils/i18n";
import { useEffect, useState } from "react";

interface TestimonialItem {
  nameVI: string;
  nameEN: string;
  roleVI: string;
  roleEN: string;
  commentVI: string;
  commentEN: string;
  avatar: string;
  rating: number;
}

const testimonials: TestimonialItem[] = [
  {
    nameVI: "Nguyễn Văn A",
    nameEN: "Nguyen Van A",
    roleVI: "Chủ shop online",
    roleEN: "Online Shop Owner",
    commentVI: "WriteSmart đã giúp tôi tiết kiệm hàng giờ viết bài mỗi tuần. Nội dung được tạo ra luôn chất lượng và tăng lượng truy cập vào website của tôi đáng kể.",
    commentEN: "WriteSmart has helped me save hours of writing each week. The content created is always high quality and has significantly increased traffic to my website.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  {
    nameVI: "Trần Thị B",
    nameEN: "Tran Thi B",
    roleVI: "Content Marketing",
    roleEN: "Content Marketing",
    commentVI: "Là người làm content marketing, tôi cần tạo nhiều bài viết mỗi ngày. WriteSmart giúp tôi tạo nội dung nhanh chóng với chất lượng tuyệt vời.",
    commentEN: "As a content marketer, I need to create multiple articles every day. WriteSmart helps me create content quickly with excellent quality.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5
  },
  {
    nameVI: "Lê Văn C",
    nameEN: "Le Van C",
    roleVI: "SEO Specialist",
    roleEN: "SEO Specialist",
    commentVI: "Các bài viết được tạo ra bởi WriteSmart luôn chuẩn SEO và giúp website của khách hàng tôi tăng thứ hạng trên Google một cách đáng kinh ngạc.",
    commentEN: "The articles created by WriteSmart are always SEO-optimized and help my clients' websites increase their Google rankings amazingly.",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    rating: 4
  }
];

const Testimonials = () => {
  const { locale } = useI18n();
  
  return (
    <div className="bg-gray-50 py-16">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">{t("testimonials.title")}</h2>
          <p className="text-gray-600 text-lg">
            {t("testimonials.description")}
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={locale === "vi" ? testimonial.nameVI : testimonial.nameEN}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold">{locale === "vi" ? testimonial.nameVI : testimonial.nameEN}</h4>
                  <p className="text-gray-500 text-sm">{locale === "vi" ? testimonial.roleVI : testimonial.roleEN}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i}
                    size={16} 
                    className={i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <p className="text-gray-600">{locale === "vi" ? testimonial.commentVI : testimonial.commentEN}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
