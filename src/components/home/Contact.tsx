
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { Mail, Phone } from "lucide-react";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Gọi API hoặc gửi email ở đây, hiện tại chỉ hiển thị thông báo
    toast({
      title: "Đã nhận thông tin",
      description: "Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: ""
    });
  };

  return (
    <div id="contact" className="bg-gray-50 py-16">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-bold mb-4">Liên hệ với chúng tôi</h2>
          <p className="text-gray-600 text-lg">
            Bạn có câu hỏi hoặc cần tư vấn? Hãy liên hệ với chúng tôi ngay hôm nay!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-6">Gửi tin nhắn</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="example@email.com"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="0912345678"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Tin nhắn
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Nhập nội dung tin nhắn của bạn"
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Gửi tin nhắn
              </Button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6">Thông tin liên hệ</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:info@writesmart.vn" className="text-gray-600 hover:text-primary">
                      info@writesmart.vn
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Điện thoại</p>
                    <a href="tel:+84912345678" className="text-gray-600 hover:text-primary">
                      0912 345 678
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="font-medium mb-3">Giờ làm việc</h4>
              <p className="text-gray-600">Thứ Hai - Thứ Sáu: 8:30 - 17:30</p>
              <p className="text-gray-600">Thứ Bảy: 8:30 - 12:00</p>
              <p className="text-gray-600">Chủ Nhật: Nghỉ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
