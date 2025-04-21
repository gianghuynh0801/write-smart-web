
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";

const Contact = () => {
  const { t } = useTranslation('contact');
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
      title: t('form.toast.title'),
      description: t('form.toast.description'),
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
          <h2 className="text-3xl font-bold mb-4">{t('title')}</h2>
          <p className="text-gray-600 text-lg">
            {t('description')}
          </p>
        </div>

        <div className="grid md:grid-cols-12 gap-8 max-w-5xl mx-auto">
          {/* Form section */}
          <div className="md:col-span-7">
            <Card>
              <CardContent className="pt-6 p-6">
                <h3 className="text-xl font-bold mb-6">{t('form.button')}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.name')}
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('form.placeholder.name')}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.email')}
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('form.placeholder.email')}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.phone')}
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('form.placeholder.phone')}
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('form.message')}
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('form.placeholder.message')}
                      rows={4}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {t('form.button')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact info section */}
          <div className="md:col-span-5">
            <Card className="h-full">
              <CardContent className="pt-6 p-6 h-full flex flex-col">
                <div>
                  <h3 className="text-xl font-bold mb-6">{t('info.title')}</h3>
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-4 flex-shrink-0">
                        <Mail className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="font-medium">Email</p>
                        <a href="mailto:info@writesmart.vn" className="text-gray-600 hover:text-primary">
                          info@writesmart.vn
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-4 flex-shrink-0">
                        <Phone className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="font-medium">Số điện thoại</p>
                        <a href="tel:+84912345678" className="text-gray-600 hover:text-primary">
                          0912 345 678
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-4 flex-shrink-0">
                        <MapPin className="text-primary" size={20} />
                      </div>
                      <div>
                        <p className="font-medium">Địa chỉ</p>
                        <p className="text-gray-600">
                          Tầng 15, Tòa nhà Sunshine Center, 16 Phạm Hùng, Hà Nội
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-start">
                    <div className="bg-primary/10 p-2 rounded-full mr-4 flex-shrink-0">
                      <Clock className="text-primary" size={20} />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Giờ làm việc</h4>
                      <p className="text-gray-600">Thứ 2 - Thứ 6: 8:00 - 17:30</p>
                      <p className="text-gray-600">Thứ 7: 8:00 - 12:00</p>
                      <p className="text-gray-600">Chủ nhật: Nghỉ</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
