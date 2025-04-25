
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Mail } from "lucide-react";
import { isValidEmail } from "@/utils/validation";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { sendVerificationEmail } = useEmailVerification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin.",
        variant: "destructive"
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: "Lỗi",
        description: "Địa chỉ email không hợp lệ.",
        variant: "destructive"
      });
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu xác nhận không khớp.",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 8 ký tự.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // First, check if the email already exists
      console.log("Kiểm tra email đã tồn tại:", formData.email);
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', formData.email)
        .maybeSingle();

      if (existingUser) {
        throw new Error("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      }

      // Create the user in auth
      console.log("Bắt đầu tạo tài khoản:", formData.email);
      const { data, error } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          data: { 
            full_name: formData.name,
            email_verified: false
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        console.log("Đã tạo tài khoản thành công, ID:", data.user.id);
        
        try {
          // Wait for the user record to be created in the database
          // This wait is important because sometimes user data might not be immediately accessible
          console.log("Đợi 1.5 giây để đảm bảo user record được tạo...");
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Double-check that the user exists in our database
          console.log("Xác nhận user tồn tại:", data.user.id);
          const { data: userData, error: userCheckError } = await supabase
            .from('users')
            .select('id, email')
            .eq('id', data.user.id)
            .maybeSingle();
          
          if (userCheckError) {
            console.error("Lỗi kiểm tra user:", userCheckError);
            throw new Error("Không thể xác minh tài khoản: " + userCheckError.message);
          }
          
          if (!userData) {
            console.error("Không tìm thấy user trong database:", data.user.id);
            throw new Error("Tài khoản đã được tạo nhưng không tìm thấy trong hệ thống. Vui lòng thử đăng nhập.");
          }
          
          console.log("Đã xác nhận user tồn tại:", userData);
          
          // Update user profile in our custom users table
          console.log("Cập nhật thông tin user:", data.user.id);
          const { error: userUpdateError } = await supabase
            .from('users')
            .update({ 
              name: formData.name, 
              email_verified: false,
              status: 'inactive' 
            })
            .eq('id', data.user.id);

          if (userUpdateError) throw userUpdateError;
          
          // After the user record is confirmed, send the verification email
          console.log("Gửi email xác thực cho:", formData.email);
          await sendVerificationEmail({
            email: formData.email,
            name: formData.name,
            userId: data.user.id,
            type: "email_verification"
          });
          
          console.log("Đã gửi email xác thực thành công");
          navigate("/verify-email-prompt");
        } catch (emailError: any) {
          console.error("Lỗi gửi email xác thực:", emailError);
          // Even if email sending fails, we've created the user, so navigate to the prompt page
          toast({
            title: "Cảnh báo",
            description: "Đã tạo tài khoản nhưng không thể gửi email xác thực. Vui lòng liên hệ hỗ trợ.",
            variant: "destructive"
          });
          navigate("/verify-email-prompt");
        }
      } else {
        throw new Error("Không thể tạo tài khoản. Vui lòng thử lại sau.");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.code === "23505" || error.message?.includes("users_email_key")) {
        setError("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      } else {
        setError(error.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
      }

      toast({
        title: "Lỗi đăng ký",
        description: error.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeVerificationDialog = () => {
    setShowVerificationDialog(false);
    navigate("/login");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name">Họ và tên</Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Nhập họ và tên"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
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
          <Label htmlFor="password">Mật khẩu</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            minLength={8}
          />
        </div>
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Đăng ký"}
        </Button>
      </form>

      <Dialog open={showVerificationDialog} onOpenChange={closeVerificationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Xác thực email của bạn</DialogTitle>
            <DialogDescription className="text-center">
              Chúng tôi đã gửi email xác thực đến <strong>{formData.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <div className="text-center space-y-2">
              <p>Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác thực để kích hoạt tài khoản.</p>
              <p className="text-sm text-gray-500">Nếu bạn không nhận được email, hãy kiểm tra thư mục spam hoặc thử đăng ký lại.</p>
            </div>
            <Button className="mt-4" onClick={closeVerificationDialog}>
              Đã hiểu
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
