
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Mail } from "lucide-react";

const VerifyEmailPrompt = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-blue-100 p-4">
              <Mail className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Xác thực email</h1>
          <p className="text-gray-600">
            Chúng tôi đã gửi một email xác thực đến địa chỉ email của bạn. 
            Vui lòng kiểm tra hộp thư và nhấp vào liên kết để xác thực tài khoản.
          </p>
          <div className="space-y-4">
            <Button onClick={() => navigate("/login")}>
              Quay lại trang đăng nhập
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Không nhận được email? Kiểm tra thư mục spam hoặc thử đăng ký lại.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmailPrompt;
