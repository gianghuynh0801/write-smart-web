import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/admin/LoginForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Shield, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [showTimeout, setShowTimeout] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createAdminEmail, setCreateAdminEmail] = useState("admin@example.com");
  const [createAdminPassword, setCreateAdminPassword] = useState("Admin123!");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const auth = useAuth(); // Sử dụng hook useAuth để truy cập AuthContext
  
  // Hàm xử lý đăng nhập quản trị viên
  const handleAdminLogin = async (username: string, password: string) => {
    if (isLoading || !isMounted.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Đang xử lý đăng nhập admin...");
      
      // Sử dụng login từ AuthContext thay vì gọi trực tiếp Supabase
      await auth.login(username, password);
      
      // Đảm bảo lấy thông tin người dùng mới nhất từ AuthContext
      if (!auth.user) {
        throw new Error("Đăng nhập thất bại: Không lấy được thông tin người dùng");
      }
      
      console.log("Đăng nhập thành công, kiểm tra quyền admin...");

      // Kiểm tra quyền admin sử dụng checkAdminStatus từ AuthContext
      const isAdmin = await auth.checkAdminStatus(auth.user.id);
      
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

  // Hàm tạo tài khoản quản trị viên mới
  const handleCreateAdmin = async () => {
    if (isCreatingAdmin || !createAdminEmail || !createAdminPassword) return;

    setIsCreatingAdmin(true);
    setCreateAdminError(null);

    try {
      console.log("Đang tạo tài khoản admin mới...");
      const { data, error } = await supabase.functions.invoke('add-admin-user', {
        body: {
          email: createAdminEmail,
          password: createAdminPassword,
          name: "Quản trị viên"
        }
      });

      if (error) {
        console.error("Lỗi khi tạo tài khoản admin:", error);
        setCreateAdminError(error.message || "Không thể tạo tài khoản quản trị viên");
        toast({
          title: "Tạo tài khoản thất bại",
          description: error.message || "Không thể tạo tài khoản quản trị viên",
          variant: "destructive"
        });
        return;
      }

      console.log("Kết quả tạo tài khoản admin:", data);
      toast({
        title: "Tạo tài khoản thành công",
        description: "Tài khoản quản trị viên đã được tạo. Vui lòng đăng nhập.",
      });

      setShowCreateAdmin(false);
      setCreateAdminEmail("");
      setCreateAdminPassword("");
    } catch (error: any) {
      console.error("Lỗi không mong đợi:", error);
      setCreateAdminError(error.message || "Đã xảy ra lỗi không mong đợi");
      toast({
        title: "Lỗi hệ thống",
        description: error.message || "Đã xảy ra lỗi không mong đợi",
        variant: "destructive"
      });
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  // Kiểm tra phiên đăng nhập khi trang tải
  useEffect(() => {
    isMounted.current = true;
    
    const checkAdminSession = async () => {
      try {
        console.log("Kiểm tra phiên admin hiện tại...");
        
        // Kiểm tra xem đã có session chưa
        if (auth.session && auth.user) {
          console.log("Đã tìm thấy session, user ID:", auth.user.id);
          
          // Kiểm tra quyền admin từ AuthContext
          const isAdmin = await auth.checkAdminStatus(auth.user.id);
            
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
    
    // Chỉ thực hiện kiểm tra khi AuthContext đã hoàn thành việc kiểm tra ban đầu
    if (!auth.isChecking) {
      checkAdminSession();
    } else {
      // Nếu AuthContext đang kiểm tra, đợi một lúc rồi mới thực hiện kiểm tra phiên
      const waitForAuthContext = setTimeout(() => {
        if (!auth.isChecking && isMounted.current) {
          checkAdminSession();
        } else if (isMounted.current) {
          // Nếu vẫn đang kiểm tra sau 3 giây, hiển thị trạng thái xử lý
          setShowProcessing(true);
          
          // Nếu vẫn đang kiểm tra sau 8 giây, coi như đã hết thời gian
          const timeoutId = setTimeout(() => {
            if (isMounted.current) {
              setShowTimeout(true);
              setIsChecking(false);
            }
          }, 5000);
          
          return () => clearTimeout(timeoutId);
        }
      }, 3000);
      
      return () => clearTimeout(waitForAuthContext);
    }
    
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
  }, [navigate, auth.session, auth.user, auth.isChecking, auth.checkAdminStatus]);

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

          <div className="mt-6 flex justify-center">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => setShowCreateAdmin(true)}
            >
              <UserPlus className="h-3 w-3" />
              Tạo tài khoản quản trị
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog tạo tài khoản quản trị viên */}
      <Dialog open={showCreateAdmin} onOpenChange={setShowCreateAdmin}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo tài khoản quản trị viên</DialogTitle>
          </DialogHeader>
          
          {createAdminError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{createAdminError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border rounded-md"
                value={createAdminEmail}
                onChange={(e) => setCreateAdminEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border rounded-md"
                value={createAdminPassword}
                onChange={(e) => setCreateAdminPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500">Mật khẩu cần có ít nhất 6 ký tự</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateAdmin(false)}>Hủy</Button>
            <Button 
              onClick={handleCreateAdmin} 
              disabled={isCreatingAdmin || !createAdminEmail || !createAdminPassword || createAdminPassword.length < 6}
            >
              {isCreatingAdmin ? "Đang tạo..." : "Tạo tài khoản"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLogin;
