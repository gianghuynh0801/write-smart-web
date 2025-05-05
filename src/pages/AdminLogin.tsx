
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm, { defaultAdmin } from "@/components/admin/LoginForm";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle, Shield, UserPlus, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { adminUserService } from "@/services/auth/adminUserService";

const AdminLogin = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [showTimeout, setShowTimeout] = useState(false);
  const [showProcessing, setShowProcessing] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [createAdminEmail, setCreateAdminEmail] = useState(defaultAdmin.email);
  const [createAdminPassword, setCreateAdminPassword] = useState(defaultAdmin.password);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [createAdminError, setCreateAdminError] = useState<string | null>(null);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState(defaultAdmin.email);
  const [resetPassword, setResetPassword] = useState(defaultAdmin.password);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [resetPasswordError, setResetPasswordError] = useState<string | null>(null);
  const isMounted = useRef(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Hàm xử lý đăng nhập quản trị viên
  const handleAdminLogin = async (email: string, password: string) => {
    if (isLoading || !isMounted.current) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Đang xử lý đăng nhập admin với email:", email);
      
      // Đăng nhập sử dụng Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      
      if (error) {
        throw error;
      }
      
      if (!data.user || !data.session) {
        throw new Error("Đăng nhập thất bại: Không lấy được thông tin người dùng");
      }
      
      console.log("Đăng nhập thành công, kiểm tra quyền admin cho user ID:", data.user.id);

      // Kiểm tra quyền admin trong cả hai bảng
      let isAdmin = false;
      
      // Kiểm tra trong bảng seo_project.users
      try {
        const { data: userData, error: userError } = await supabase
          .from('seo_project.users')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
        
        if (userError) {
          console.log("Lỗi khi kiểm tra seo_project.users:", userError);
        } else if (userData?.role === 'admin') {
          console.log("Tìm thấy quyền admin trong bảng seo_project.users");
          isAdmin = true;
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra seo_project.users:", error);
      }
      
      // Kiểm tra trong bảng seo_project.user_roles nếu chưa tìm thấy
      if (!isAdmin) {
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('seo_project.user_roles')
            .select('*')
            .eq('user_id', data.user.id)
            .eq('role', 'admin')
            .maybeSingle();
          
          if (roleError) {
            console.log("Lỗi khi kiểm tra seo_project.user_roles:", roleError);
          } else if (roleData) {
            console.log("Tìm thấy quyền admin trong bảng seo_project.user_roles");
            isAdmin = true;
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra seo_project.user_roles:", error);
        }
      }
      
      // Nếu không có quyền admin
      if (!isAdmin) {
        console.log("Người dùng không có quyền admin");
        
        // Đăng xuất
        await supabase.auth.signOut();
        
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
      
      // Tạo tài khoản mới trong Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createAdminEmail,
        password: createAdminPassword,
        options: {
          data: {
            name: "Quản trị viên",
            role: "admin"
          }
        }
      });

      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Không thể tạo tài khoản mới");
      }
      
      console.log("Đã tạo tài khoản auth.users với ID:", authData.user.id);
      
      // Thêm người dùng vào bảng seo_project.users
      const { error: insertError } = await supabase
        .from('seo_project.users')
        .insert({
          id: authData.user.id,
          email: createAdminEmail,
          name: "Quản trị viên",
          role: 'admin'
        });
        
      if (insertError) {
        console.error("Lỗi khi thêm vào seo_project.users:", insertError);
        
        // Nếu lỗi là do xung đột (tài khoản đã tồn tại), thử cập nhật
        if (insertError.code === '23505') { // mã lỗi unique_violation
          console.log("Tài khoản đã tồn tại trong seo_project.users, thử cập nhật");
          
          const { error: updateError } = await supabase
            .from('seo_project.users')
            .update({
              role: 'admin',
              name: "Quản trị viên"
            })
            .eq('email', createAdminEmail);
            
          if (updateError) {
            console.error("Lỗi khi cập nhật seo_project.users:", updateError);
          }
        }
      }
      
      // Thêm vào bảng seo_project.user_roles
      const { error: roleError } = await supabase
        .from('seo_project.user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin'
        });
        
      if (roleError) {
        console.error("Lỗi khi thêm vào seo_project.user_roles:", roleError);
        
        // Nếu lỗi là do xung đột, đó là điều bình thường
        if (roleError.code !== '23505') {
          console.warn("Lỗi thêm vào seo_project.user_roles không phải do trùng lặp");
        }
      }

      toast({
        title: "Tạo tài khoản thành công",
        description: "Tài khoản quản trị viên đã được tạo. Vui lòng đăng nhập.",
      });

      setShowCreateAdmin(false);
      
      // Đặt giá trị email vừa tạo để sẵn sàng đăng nhập
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
  
  // Hàm đặt lại mật khẩu cho tài khoản admin
  const handleResetPassword = async () => {
    if (isResettingPassword || !resetEmail || !resetPassword || resetPassword.length < 6) return;
    
    setIsResettingPassword(true);
    setResetPasswordError(null);
    
    try {
      console.log("Đang đặt lại mật khẩu cho tài khoản admin:", resetEmail);
      
      // Tìm userId bằng email
      const { data: userData, error: userError } = await supabase
        .from('seo_project.users')
        .select('id')
        .eq('email', resetEmail)
        .maybeSingle();
        
      if (userError) {
        console.error("Lỗi khi tìm user id:", userError);
        throw new Error("Không thể tìm thấy tài khoản admin");
      }
      
      if (!userData) {
        throw new Error("Không tìm thấy tài khoản admin với email này");
      }
      
      // Đặt lại mật khẩu sử dụng hàm từ adminUserService
      try {
        // Sử dụng API admin để cập nhật mật khẩu
        const { error: resetError } = await supabase.auth.admin.updateUserById(
          userData.id,
          { password: resetPassword }
        );
        
        if (resetError) {
          throw resetError;
        }
      } catch (resetError) {
        console.error("Lỗi khi đặt lại mật khẩu:", resetError);
        
        // Thử phương pháp thay thế: Gửi email đặt lại mật khẩu
        try {
          const { error: resetLinkError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: `${window.location.origin}/reset-password`
          });
          
          if (resetLinkError) {
            throw resetLinkError;
          }
          
          toast({
            title: "Email đặt lại mật khẩu đã được gửi",
            description: "Vui lòng kiểm tra hộp thư đến của bạn và làm theo hướng dẫn để đặt lại mật khẩu."
          });
          
          setShowResetPassword(false);
          return;
        } catch (emailError) {
          console.error("Lỗi khi gửi email đặt lại mật khẩu:", emailError);
          throw new Error("Không thể đặt lại mật khẩu hoặc gửi email đặt lại");
        }
      }
      
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: "Mật khẩu đã được cập nhật. Vui lòng đăng nhập bằng mật khẩu mới."
      });
      
      setShowResetPassword(false);
      
    } catch (error: any) {
      console.error("Lỗi khi đặt lại mật khẩu:", error);
      setResetPasswordError(error.message || "Đã xảy ra lỗi không mong đợi");
      
      toast({
        title: "Lỗi đặt lại mật khẩu",
        description: error.message || "Không thể đặt lại mật khẩu",
        variant: "destructive"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Kiểm tra phiên đăng nhập khi trang tải
  useEffect(() => {
    isMounted.current = true;
    
    const checkAdminSession = async () => {
      try {
        console.log("Kiểm tra phiên admin hiện tại...");
        
        // Kiểm tra xem đã có session chưa
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (sessionData.session && sessionData.session.user) {
          console.log("Đã tìm thấy session, user ID:", sessionData.session.user.id);
          
          // Kiểm tra quyền admin trong cả hai bảng
          let isAdmin = false;
          
          // Kiểm tra trong bảng seo_project.users
          try {
            const { data: userData, error: userError } = await supabase
              .from('seo_project.users')
              .select('role')
              .eq('id', sessionData.session.user.id)
              .maybeSingle();
            
            if (userError) {
              console.log("Lỗi khi kiểm tra seo_project.users:", userError);
            } else if (userData?.role === 'admin') {
              console.log("Tìm thấy quyền admin trong bảng seo_project.users");
              isAdmin = true;
            }
          } catch (error) {
            console.error("Lỗi khi kiểm tra seo_project.users:", error);
          }
          
          // Kiểm tra trong bảng seo_project.user_roles nếu chưa tìm thấy
          if (!isAdmin) {
            try {
              const { data: roleData, error: roleError } = await supabase
                .from('seo_project.user_roles')
                .select('*')
                .eq('user_id', sessionData.session.user.id)
                .eq('role', 'admin')
                .maybeSingle();
              
              if (roleError) {
                console.log("Lỗi khi kiểm tra seo_project.user_roles:", roleError);
              } else if (roleData) {
                console.log("Tìm thấy quyền admin trong bảng seo_project.user_roles");
                isAdmin = true;
              }
            } catch (error) {
              console.error("Lỗi khi kiểm tra seo_project.user_roles:", error);
            }
          }
          
          if (isAdmin) {
            console.log("Đã phát hiện phiên admin, chuyển hướng đến trang admin");
            if (isMounted.current) navigate("/admin");
            return;
          }
          
          console.log("Người dùng đã đăng nhập nhưng không có quyền admin");
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
          
          <LoginForm onSubmit={handleAdminLogin} isLoading={isLoading} error={error} />

          <div className="mt-6 flex justify-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => setShowCreateAdmin(true)}
            >
              <UserPlus className="h-3 w-3" />
              Tạo tài khoản
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1 text-xs"
              onClick={() => setShowResetPassword(true)}
            >
              <RefreshCcw className="h-3 w-3" />
              Đặt lại mật khẩu
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
      
      {/* Dialog đặt lại mật khẩu */}
      <Dialog open={showResetPassword} onOpenChange={setShowResetPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đặt lại mật khẩu quản trị</DialogTitle>
          </DialogHeader>
          
          {resetPasswordError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{resetPasswordError}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email admin</label>
              <input 
                type="email" 
                className="w-full px-3 py-2 border rounded-md"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu mới</label>
              <input 
                type="password" 
                className="w-full px-3 py-2 border rounded-md"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500">Mật khẩu mới cần có ít nhất 6 ký tự</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetPassword(false)}>Hủy</Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={isResettingPassword || !resetEmail || !resetPassword || resetPassword.length < 6}
            >
              {isResettingPassword ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLogin;
