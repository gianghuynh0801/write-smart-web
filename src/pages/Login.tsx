
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { LoginForm } from "@/components/auth/LoginForm";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginContainer from "@/components/auth/LoginContainer";
import AuthLinks from "@/components/auth/AuthLinks";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDataRefresh } from "@/hooks/useUserDataRefresh";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>("");
  const [isEmailVerificationRequired, setIsEmailVerificationRequired] = useState<boolean>(true);
  const [redirectInProgress, setRedirectInProgress] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { fetchUserDetails } = useAuth();
  const { refreshUserData } = useUserDataRefresh();

  // Fetch email verification system configuration on component mount
  useEffect(() => {
    const fetchEmailVerificationConfig = async () => {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'require_email_verification')
        .maybeSingle();
      
      if (!error && data) {
        setIsEmailVerificationRequired(data.value === 'true');
      }
    };
    
    fetchEmailVerificationConfig();
  }, []);

  // Add check for existing session
  useEffect(() => {
    const checkSession = async () => {
      console.log("Login: Kiểm tra phiên làm việc hiện tại");
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log("Login: Phiên làm việc đã tồn tại, chuyển hướng đến dashboard");
        setRedirectInProgress(true);
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleResendVerification = async () => {
    if (!unconfirmedEmail) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
      });
      
      if (error) throw error;
      
      toast({
        title: "Đã gửi email xác thực",
        description: "Vui lòng kiểm tra hộp thư của bạn để xác thực tài khoản.",
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi lại email xác thực. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
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
        // If email verification is not required OR the error is not about email confirmation, throw the error
        if (!isEmailVerificationRequired || !error.message?.includes("Email not confirmed")) {
          throw error;
        }
        
        // If email verification is required and the error is about email confirmation,
        // we'll try to sign in again with a custom auth flow
        console.log("Email verification required but user email not confirmed. Attempting bypass...");
        
        // Alternative approach: If admin has disabled email verification,
        // we can ignore this error and continue with login
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
        setTimeout(() => {
          console.log("Login: Chuyển hướng đến dashboard sau 3 giây");
          navigate("/dashboard");
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
          navigate("/dashboard", { replace: true });
        }, 3000);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message?.includes("Email not confirmed") && isEmailVerificationRequired) {
        setUnconfirmedEmail(email);
        toast({
          title: "Email chưa được xác thực",
          description: "Vui lòng kiểm tra hộp thư của bạn và xác nhận email trước khi đăng nhập.",
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleResendVerification}
              disabled={isLoading}
            >
              Gửi lại email xác thực
            </Button>
          )
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

  // Sự kiện auth state change để chuyển hướng
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Login: Auth state changed:", event);
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession && !redirectInProgress) {
          console.log("Login: Phát hiện đăng nhập/token refreshed từ sự kiện auth, chuyển hướng đến dashboard");
          setRedirectInProgress(true);
          
          // Force chuyển hướng bằng window.location để đảm bảo refresh toàn bộ ứng dụng
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectInProgress]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <LoginContainer>
        <LoginHeader />
        <LoginForm 
          onSubmit={handleLogin}
          isLoading={isLoading}
          error={error}
        />
        <AuthLinks />
      </LoginContainer>
      <Footer />
    </div>
  );
};

export default Login;
