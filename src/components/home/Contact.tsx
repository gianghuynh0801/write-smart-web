
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Mail, Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

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

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm">
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
          </div>

          <div className="bg-white p-8 rounded-lg shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6">{t('info.title')}</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <Mail className="text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('info.email')}</p>
                    <a href="mailto:info@writesmart.vn" className="text-gray-600 hover:text-primary">
                      info@writesmart.vn
                    </a>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="text-primary mr-3 mt-1 flex-shrink-0" />
                  <div>
                    <p className="font-medium">{t('info.phone')}</p>
                    <a href="tel:+84912345678" className="text-gray-600 hover:text-primary">
                      0912 345 678
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h4 className="font-medium mb-3">{t('info.workingHours')}</h4>
              <p className="text-gray-600">{t('info.workingDays.weekdays')}</p>
              <p className="text-gray-600">{t('info.workingDays.saturday')}</p>
              <p className="text-gray-600">{t('info.workingDays.sunday')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
