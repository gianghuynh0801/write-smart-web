
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/admin/LoginForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [showTimeout, setShowTimeout] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const isMounted = useRef(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Hàm xử lý đăng nhập quản trị viên
  const handleAdminLogin = async (username: string, password: string) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Đang xử lý đăng nhập admin...");
      
      // Kiểm tra đăng nhập bằng email
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: username.includes('@') ? username : `${username}@example.com`,
        password
      });
      
      if (loginError) {
        console.error("Lỗi đăng nhập:", loginError);
        throw loginError;
      }

      if (!data.user) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }

      console.log("Đăng nhập thành công, kiểm tra quyền admin...");

      // Kiểm tra quyền admin - thử từng cách một
      let isAdmin = false;
      
      // Cách 1: Kiểm tra bằng RPC function
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('is_admin', { uid: data.user.id });
        if (!rpcError && rpcData === true) {
          isAdmin = true;
          console.log("Xác thực admin thành công qua RPC");
        }
      } catch (rpcErr) {
        console.log("Lỗi khi kiểm tra admin qua RPC:", rpcErr);
      }
      
      // Cách 2: Kiểm tra từ bảng user_roles nếu RPC thất bại
      if (!isAdmin) {
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('*')
            .eq('user_id', data.user.id)
            .eq('role', 'admin')
            .maybeSingle();
            
          if (!roleError && roleData) {
            isAdmin = true;
            console.log("Xác thực admin thành công qua user_roles");
          }
        } catch (roleErr) {
          console.log("Lỗi khi kiểm tra admin qua user_roles:", roleErr);
        }
      }
      
      // Cách 3: Kiểm tra từ bảng users nếu cả 2 cách trên thất bại
      if (!isAdmin) {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();
            
          if (!userError && userData?.role === 'admin') {
            isAdmin = true;
            console.log("Xác thực admin thành công qua user role");
          }
        } catch (userErr) {
          console.log("Lỗi khi kiểm tra admin qua users:", userErr);
        }
      }

      if (!isAdmin) {
        await supabase.auth.signOut(); // Đăng xuất nếu không phải admin
        throw new Error("Tài khoản của bạn không có quyền quản trị");
      }
      
      // Thông báo thành công và chuyển hướng
      toast({
        title: "Đăng nhập thành công",
        description: "Bạn đã đăng nhập với quyền quản trị.",
      });
      
      // Chuyển hướng đến trang quản trị
      navigate("/admin");
      
    } catch (error: any) {
      console.error("Lỗi đăng nhập admin:", error);
      setError(error.message || "Đăng nhập thất bại");
      
      toast({
        title: "Đăng nhập thất bại",
        description: error.message || "Không thể đăng nhập vào trang quản trị",
        variant: "destructive"
      });
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  // Kiểm tra phiên đăng nhập khi trang tải
  useEffect(() => {
    isMounted.current = true;
    
    const checkAdminSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          let isAdmin = false;
          
          // Thử kiểm tra quyền admin bằng nhiều cách
          // Cách 1: Kiểm tra bằng RPC function
          try {
            const { data: rpcData, error: rpcError } = await supabase.rpc('is_admin', { uid: session.user.id });
            if (!rpcError && rpcData === true) {
              isAdmin = true;
            }
          } catch (err) {
            console.log("Lỗi khi gọi RPC is_admin:", err);
          }
          
          // Cách 2: Kiểm tra từ bảng user_roles nếu RPC thất bại
          if (!isAdmin) {
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('*')
              .eq('user_id', session.user.id)
              .eq('role', 'admin')
              .maybeSingle();
              
            if (!roleError && roleData) {
              isAdmin = true;
            }
          }
          
          // Cách 3: Kiểm tra từ bảng users nếu các cách trên thất bại
          if (!isAdmin) {
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('role')
              .eq('id', session.user.id)
              .maybeSingle();
              
            if (!userError && userData?.role === 'admin') {
              isAdmin = true;
            }
          }
            
          if (isAdmin) {
            // Có quyền admin, chuyển hướng đến trang quản trị
            console.log("Đã phát hiện phiên admin hiện tại, chuyển hướng đến trang admin");
            navigate("/admin");
            return;
          } else {
            console.log("Người dùng đã đăng nhập nhưng không có quyền admin");
          }
        }
      } catch (error) {
        console.error("Lỗi kiểm tra phiên admin:", error);
      } finally {
        if (isMounted.current) {
          setIsChecking(false);
        }
      }
    };
    
    checkAdminSession();
    
    // Hiển thị thông báo timeout nếu isChecking kéo dài quá lâu
    const processingId = window.setTimeout(() => {
      if (isMounted.current && isChecking) {
        setShowProcessing(true);
      }
    }, 3000);
    
    const timeoutId = window.setTimeout(() => {
      if (isMounted.current && isChecking) {
        setShowTimeout(true);
        setIsChecking(false); // Auto-end checking after timeout
      }
    }, 8000);
    
    return () => {
      isMounted.current = false;
      clearTimeout(processingId);
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md w-full">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Quản trị hệ thống</h2>
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4 mt-4"></div>
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
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-center mb-6">
            <div className="p-2 bg-primary/10 rounded-full">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6">Đăng nhập quản trị</h2>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <LoginForm onSubmit={handleAdminLogin} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
