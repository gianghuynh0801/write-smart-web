
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { LoginForm } from "@/components/admin/LoginForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AdminLogin = () => {
  const { isLoading, isChecking, handleAdminLogin } = useAdminAuth();

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
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
