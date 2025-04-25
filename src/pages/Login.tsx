
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Mail } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error message when user changes input
    setError(null);
    setIsEmailNotConfirmed(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear error message before processing
    setError(null);
    setIsEmailNotConfirmed(false);
    
    // Validate form
    if (!formData.email || !formData.password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Sign in with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: formData.email, 
        password: formData.password
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: "Đăng nhập thành công!",
          description: "Đang chuyển hướng đến bảng điều khiển...",
        });
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Check specifically for email not confirmed error
      if (error.message?.includes("Email not confirmed")) {
        setIsEmailNotConfirmed(true);
        setUnconfirmedEmail(formData.email);
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
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Email hoặc mật khẩu không chính xác.");
      } else {
        setError(error.message || "Đã có lỗi xảy ra khi đăng nhập. Vui lòng thử lại sau.");
      }
      
      toast({
        title: "Lỗi đăng nhập",
        description: error.message?.includes("Email not confirmed") 
          ? "Email chưa được xác thực. Vui lòng xác nhận email trước khi đăng nhập." 
          : "Email hoặc mật khẩu không chính xác.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Đăng nhập</h1>
            <p className="text-gray-600 mt-2">
              Chào mừng trở lại WriteSmart
            </p>
          </div>
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Đăng ký
              </Link>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
