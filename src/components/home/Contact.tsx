
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect } from "react";
import { Mail, Phone } from "lucide-react";
import { t } from "@/utils/i18n";
import { useI18n } from "@/context/I18nContext";

const Contact = () => {
  const { toast } = useToast();
  const { locale } = useI18n();
  const [currentLocale, setCurrentLocale] = useState(locale);
  
  // Đảm bảo component được cập nhật khi ngôn ngữ thay đổi
  useEffect(() => {
    setCurrentLocale(locale);
  }, [locale]);
  
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
      title: currentLocale === "vi" ? "Đã nhận thông tin" : "Information received",
      description: currentLocale === "vi" 
        ? "Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất." 
        : "We will contact you as soon as possible.",
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
          <h2 className="text-3xl font-bold mb-4">{t("contact.title")}</h2>
          <p className="text-gray-600 text-lg">
            {t("contact.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-xl font-bold mb-6">{t("contact.send_message")}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contact.full_name")}
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("contact.enter_name")}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("contact.email")}
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
                  {t("contact.phone")}
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
                  {t("contact.message")}
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("contact.enter_message")}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                {t("contact.send_message")}
              </Button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6">{t("contact.contact_info")}</h3>
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
                    <p className="font-medium">{t("contact.phone")}</p>
                    <a href="tel:+84912345678" className="text-gray-600 hover:text-primary">
                      0912 345 678
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="font-medium mb-3">{t("contact.working_hours")}</h4>
              <p className="text-gray-600">{t("contact.monday_friday")}</p>
              <p className="text-gray-600">{t("contact.saturday")}</p>
              <p className="text-gray-600">{t("contact.sunday")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
