
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const CTA = () => {
  const { t } = useTranslation(['common', 'cta']);

  return (
    <div className="bg-primary py-16 animate-fade-in">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('cta:title')}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Đăng ký miễn phí ngay hôm nay để trải nghiệm mọi tính năng vượt trội, bắt đầu tạo nên những nội dung xuất sắc, chuyên nghiệp cho website, mạng xã hội của bạn và mở rộng khả năng tiếp cận khách hàng nhanh chóng hơn bao giờ hết!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 w-full sm:w-auto">
                {t('common:registerFree')}
              </Button>
            </Link>
            {/* Đã bỏ nút Liên hệ với chúng tôi */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTA;
