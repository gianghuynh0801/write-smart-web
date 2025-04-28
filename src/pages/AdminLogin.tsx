
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

const AdminLogin = () => {
  const { isLoading, isChecking, handleAdminLogin } = useAdminAuth();
  const [showTimeout, setShowTimeout] = useState(false);

  // Hiển thị thông báo timeout nếu isChecking kéo dài quá lâu
  useEffect(() => {
    let timeoutId: number;
    
    if (isChecking) {
      timeoutId = window.setTimeout(() => {
        setShowTimeout(true);
      }, 8000); // Hiển thị thông báo sau 8 giây nếu vẫn đang kiểm tra
    } else {
      setShowTimeout(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isChecking]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
          
          {showTimeout && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800 text-sm">
                Kiểm tra đang mất nhiều thời gian hơn dự kiến. Vui lòng thử tải lại trang nếu vẫn không có phản hồi.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => window.location.reload()}
              >
                Tải lại trang
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center text-sm text-gray-600 mb-6 hover:text-gray-900 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại trang chủ
        </Link>
        
        <LoginForm onSubmit={handleAdminLogin} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default AdminLogin;
