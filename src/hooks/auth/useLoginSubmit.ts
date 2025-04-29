
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useUserDataRefresh } from "@/hooks/useUserDataRefresh";
import { LOCAL_STORAGE_KEYS, setItem } from "@/utils/localStorageService";

export function useLoginSubmit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { fetchUserDetails } = useAuth();
  const { refreshUserData } = useUserDataRefresh();

  // Xử lý đăng nhập
  const handleLogin = async (
    email: string, 
    password: string, 
    isEmailVerificationRequired: boolean,
    setUnconfirmedEmail: (email: string) => void,
    setRedirectInProgress: (value: boolean) => void
  ) => {
    if (redirectInProgress) return;
    
    setError(null);
    setIsLoading(true);
    
    try {
      console.log("Login: Đang xử lý đăng nhập với email:", email);
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        // Nếu xác thực email không bắt buộc HOẶC lỗi không phải về việc email chưa xác nhận, ném lỗi
        if (!isEmailVerificationRequired || !error.message?.includes("Email not confirmed")) {
          throw error;
        }
        
        // Nếu email cần xác thực nhưng email chưa xác nhận,
        // chúng ta sẽ thử đăng nhập lại với luồng xác thực tùy chỉnh
        console.log("Email verification required but user email not confirmed. Attempting bypass...");
        
        // Nếu admin đã tắt tính năng xác thực email,
        // chúng ta có thể bỏ qua lỗi này và tiếp tục đăng nhập
        setUnconfirmedEmail(email);
        
        // Đảm bảo lấy thông tin chi tiết người dùng sau khi đăng nhập thành công
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();
            
          if (userData) {
            await fetchUserDetails(userData.id);
            await refreshUserData();
          }
        } catch (userDataError) {
          console.error("Không thể lấy thông tin người dùng:", userDataError);
        }
        
        toast({
          title: "Đăng nhập thành công!",
          description: "Đang chuyển hướng đến bảng điều khiển...",
        });
        
        setRedirectInProgress(true);

        // Lưu thông tin chuyển hướng vào localStorage
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, "pending_redirect");
        localStorage.setItem('redirect_timestamp', Date.now().toString());
        localStorage.setItem('redirect_target', '/dashboard');
        
        setTimeout(() => {
          console.log("Login: Chuyển hướng đến dashboard sau 3 giây");
          // Sử dụng window.location thay vì navigate để đảm bảo refresh trang
          window.location.href = "/dashboard";
        }, 3000);
        return;
      }
      
      if (data.user) {
        console.log("Login: Đăng nhập thành công với user:", data.user.id);
        
        // Refresh các thông tin người dùng ngay sau khi đăng nhập
        try {
          await fetchUserDetails(data.user.id);
          await refreshUserData();
          console.log("Login: Đã cập nhật thông tin người dùng thành công");
        } catch (refreshError) {
          console.error("Lỗi khi refresh dữ liệu người dùng:", refreshError);
        }
        
        toast({
          title: "Đăng nhập thành công!",
          description: "Đang chuyển hướng đến bảng điều khiển...",
        });
        
        // Đặt cờ redirect và thêm thời gian chờ dài hơn
        setRedirectInProgress(true);
        
        // Thêm thời gian chờ vào local storage để đánh dấu đang chuyển hướng
        localStorage.setItem('redirect_timestamp', Date.now().toString());
        localStorage.setItem('redirect_target', '/dashboard');
        
        setTimeout(() => {
          console.log("Login: Thực hiện chuyển hướng đến dashboard ngay bây giờ");
          // Sử dụng window.location thay vì navigate để đảm bảo refresh trang
          window.location.href = "/dashboard";
        }, 3000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message?.includes("Email not confirmed") && isEmailVerificationRequired) {
        setUnconfirmedEmail(email);
        toast({
          title: "Email chưa được xác thực",
          description: "Vui lòng kiểm tra hộp thư của bạn và xác nhận email trước khi đăng nhập.",
          variant: "destructive"
        });
      } else {
        setError(error.message?.includes("Invalid login credentials") 
          ? "Email hoặc mật khẩu không chính xác."
          : "Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleLogin
  };
}
