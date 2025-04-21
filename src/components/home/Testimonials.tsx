
import { Star } from "lucide-react";
import { useState } from "react";

interface TestimonialItem {
  nameVI: string;
  roleVI: string;
  commentVI: string;
  avatar: string;
  rating: number;
}

const testimonials: TestimonialItem[] = [
  {
    nameVI: "Nguyễn Văn A",
    roleVI: "Chủ shop online",
    commentVI: "WriteSmart đã giúp tôi tiết kiệm hàng giờ viết bài mỗi tuần. Nội dung được tạo ra luôn chất lượng và tăng lượng truy cập vào website của tôi đáng kể.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5
  },
  {
    nameVI: "Trần Thị B",
    roleVI: "Content Marketing",
    commentVI: "Là người làm content marketing, tôi cần tạo nhiều bài viết mỗi ngày. WriteSmart giúp tôi tạo nội dung nhanh chóng với chất lượng tuyệt vời.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5
  },
  {
    nameVI: "Lê Văn C",
    roleVI: "SEO Specialist",
    commentVI: "Các bài viết được tạo ra bởi WriteSmart luôn chuẩn SEO và giúp website của khách hàng tôi tăng thứ hạng trên Google một cách đáng kinh ngạc.",
    avatar: "https://randomuser.me/api/portraits/men/36.jpg",
    rating: 4
  }
];

const Testimonials = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Khách hàng nói gì về chúng tôi</h2>
          <p className="text-gray-600 text-lg">
            Hàng ngàn người dùng đã tin tưởng và sử dụng WriteSmart để tạo nội dung chất lượng
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
                  alt={testimonial.nameVI}
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-bold">{testimonial.nameVI}</h4>
                  <p className="text-gray-500 text-sm">{testimonial.roleVI}</p>
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
              <p className="text-gray-600">{testimonial.commentVI}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
