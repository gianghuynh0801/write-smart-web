import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import LanguageSwitcher from "@/components/common/LanguageSwitcher";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

const DashboardLayout = () => {
  const { isChecking } = useAuthRedirect('/login');
  const [isLoading, setIsLoading] = useState(true);
  const { user, session } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra phiên đăng nhập một lần nữa khi component mount
    const verifySession = async () => {
      console.log("DashboardLayout: Kiểm tra phiên làm việc");
      try {
        // Nếu đã có session trong context, không cần kiểm tra lại
        if (session) {
          console.log("DashboardLayout: Đã có phiên làm việc trong context");
          setIsLoading(false);
          return;
        }

        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!currentSession) {
          console.log("DashboardLayout: Không có phiên làm việc hợp lệ, chuyển hướng đến trang đăng nhập");
          navigate('/login', { replace: true });
          return;
        }
        
        console.log("DashboardLayout: Phiên làm việc hợp lệ, user:", currentSession.user.id);
      } catch (error) {
        console.error("DashboardLayout: Lỗi khi kiểm tra phiên làm việc:", error);
        // Force chuyển hướng bằng window.location nếu có lỗi
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };
    
    // Đợi isChecking từ useAuthRedirect thành false trước khi kiểm tra lại
    if (!isChecking) {
      verifySession();
    }
  }, [navigate, isChecking, user, session]);

  // Hiển thị trạng thái loading khi đang kiểm tra xác thực
  if (isChecking || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  // Kiểm tra cuối cùng - nếu không có user nhưng đã qua các kiểm tra trước đó
  if (!user) {
    console.log("DashboardLayout: Không có thông tin user sau khi tải xong");
    useEffect(() => {
      navigate('/login', { replace: true });
    }, []);
    
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang chuyển hướng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="lg:pl-64">
        <header className="bg-white shadow">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <Link to="/" className="flex items-center text-gray-500 hover:text-gray-700">
                <Home size={18} />
                <span className="ml-2 text-sm">Trang chủ</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              {/* Add additional header elements here like notifications */}
            </div>
          </div>
        </header>
        
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
