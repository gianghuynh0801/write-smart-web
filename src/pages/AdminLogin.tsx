
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import LoginForm from "@/components/admin/LoginForm"; // Import component LoginForm với default export
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [showTimeout, setShowTimeout] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  
  // Hàm xử lý đăng nhập quản trị viên
  const handleAdminLogin = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Kiểm tra đăng nhập bằng email
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: username.includes('@') ? username : `${username}@example.com`,
        password
      });
      
      if (loginError) {
        throw loginError;
      }

      if (!data.user) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      // Kiểm tra quyền admin 
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles' as any)
        .select('*')
        .eq('user_id', data.user.id as any)
        .eq('role', 'admin' as any)
        .single();

      if (roleError || !roleData) {
        await supabase.auth.signOut(); // Đăng xuất nếu không phải admin
        throw new Error("Tài khoản của bạn không có quyền quản trị");
      }
      
      // Chuyển hướng đến trang quản trị
      window.location.href = "/admin";
      
    } catch (error: any) {
      console.error("Lỗi đăng nhập admin:", error);
      setError(error.message || "Đăng nhập thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // Kiểm tra phiên đăng nhập khi trang tải
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (session.session) {
          // Kiểm tra quyền admin
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles' as any)
            .select('*')
            .eq('user_id', session.session.user.id as any)
            .eq('role', 'admin' as any)
            .single();
            
          if (!roleError && roleData) {
            // Có quyền admin, chuyển hướng đến trang quản trị
            window.location.href = "/admin";
            return;
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra phiên admin:", error);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAdminSession();
  }, []);

  // Hiển thị thông báo timeout nếu isChecking kéo dài quá lâu
  useEffect(() => {
    let timeoutId: number;
    let processingId: number;
    
    if (isChecking) {
      // Hiển thị thông báo "đang xử lý" sau 3 giây
      processingId = window.setTimeout(() => {
        setShowProcessing(true);
      }, 3000);
      
      // Hiển thị thông báo timeout sau 8 giây
      timeoutId = window.setTimeout(() => {
        setShowTimeout(true);
      }, 8000); // Hiển thị thông báo sau 8 giây nếu vẫn đang kiểm tra
    } else {
      setShowTimeout(false);
      setShowProcessing(false);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (processingId) clearTimeout(processingId);
    };
  }, [isChecking]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
          
          {showProcessing && !showTimeout && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-blue-800 text-sm">
                Đang xử lý thông tin đăng nhập. Vui lòng đợi trong giây lát...
              </p>
            </div>
          )}
          
          {showTimeout && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800 text-sm mb-2">
                Kiểm tra đang mất nhiều thời gian hơn dự kiến. Có thể có vấn đề về kết nối hoặc phiên làm việc.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  Tải lại trang
                </Button>
                <Button 
                  variant="outline"
                  size="sm" 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                >
                  Xóa dữ liệu phiên & tải lại
                </Button>
              </div>
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
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập quản trị</h2>
          <LoginForm onSubmit={handleAdminLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
