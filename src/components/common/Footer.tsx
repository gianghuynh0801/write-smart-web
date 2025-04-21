
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t, i18n } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">WriteSmart</h3>
            <p className="text-gray-400 mb-4">
              {i18n.language === 'vi' 
                ? 'Công cụ tạo nội dung chuẩn SEO hàng đầu Việt Nam, giúp bạn tiết kiệm thời gian và tối ưu hiệu quả marketing.'
                : 'Vietnam\'s leading SEO content creation tool, helping you save time and optimize marketing effectiveness.'}
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">{i18n.language === 'vi' ? 'Sản phẩm' : 'Products'}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Tính năng' : 'Features'}
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Bảng giá' : 'Pricing'}
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Tích hợp' : 'Integrations'}
                </Link>
              </li>
              <li>
                <Link to="/changelog" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Cập nhật' : 'Changelog'}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">{i18n.language === 'vi' ? 'Hỗ trợ' : 'Support'}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/documentation" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Tài liệu' : 'Documentation'}
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Trung tâm hỗ trợ' : 'Support Center'}
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Liên hệ' : 'Contact'}
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">{i18n.language === 'vi' ? 'Công ty' : 'Company'}</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Về chúng tôi' : 'About Us'}
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-gray-400 hover:text-white transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/careers" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Tuyển dụng' : 'Careers'}
                </Link>
              </li>
              <li>
                <Link to="/legal" className="text-gray-400 hover:text-white transition-colors">
                  {i18n.language === 'vi' ? 'Điều khoản' : 'Legal'}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} WriteSmart. {i18n.language === 'vi' ? 'Tất cả các quyền được bảo lưu.' : 'All rights reserved.'}
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
              {i18n.language === 'vi' ? 'Chính sách riêng tư' : 'Privacy Policy'}
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
              {i18n.language === 'vi' ? 'Điều khoản sử dụng' : 'Terms of Use'}
            </Link>
            <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors text-sm">
              {i18n.language === 'vi' ? 'Chính sách cookie' : 'Cookie Policy'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
