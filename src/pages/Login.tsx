import { useState } from "react";
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

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>("");
  const { toast } = useToast();
  const navigate = useNavigate();

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
    setError(null);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Đang chuyển hướng đến bảng điều khiển...",
        });
        
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      if (error.message?.includes("Email not confirmed")) {
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
