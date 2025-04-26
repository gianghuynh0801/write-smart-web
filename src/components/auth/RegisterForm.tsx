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
import { Eye, EyeOff } from "lucide-react";

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
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });

  const { toast } = useToast();
  const navigate = useNavigate();
  const { sendVerificationEmail } = useEmailVerification();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      return !!data;
    } catch (error) {
      console.error("Lỗi khi kiểm tra email:", error);
      return false;
    }
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
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        throw new Error("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      }

      console.log("Bắt đầu tạo tài khoản:", formData.email);
      const { data, error } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          data: { 
            full_name: formData.name,
            email_verified: false
          },
          emailRedirectTo: `${window.location.origin}/email-verified`
        }
      });
      
      if (error) throw error;
      
      if (!data?.user) {
        throw new Error("Không thể tạo tài khoản. Vui lòng thử lại sau.");
      }

      const userId = data.user.id;
      console.log("Đã tạo tài khoản trong auth thành công, ID:", userId);
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: syncData, error: syncError } = await supabase.functions.invoke("sync-user", {
        body: { 
          user_id: userId, 
          email: formData.email, 
          name: formData.name,
          email_verified: false
        }
      });
      
      if (syncError) {
        console.error("Lỗi đồng bộ người dùng:", syncError);
        throw new Error(`Không thể đồng bộ người dùng: ${syncError.message}`);
      }
      
      console.log("Kết quả đồng bộ người dùng:", syncData);
      
      const { data: checkUser, error: checkUserError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (checkUserError) {
        console.error("Lỗi kiểm tra người dùng:", checkUserError);
        throw new Error(`Không thể kiểm tra người dùng: ${checkUserError.message}`);
      }
      
      if (!checkUser) {
        console.error("Người dùng không tồn tại sau khi đồng bộ");
        throw new Error("Không thể tạo người dùng trong cơ sở dữ liệu. Vui lòng liên hệ hỗ trợ.");
      }
      
      console.log("Người dùng đã được tạo thành công trong database:", checkUser);
      
      await supabase.auth.signOut();
      console.log("Đã đăng xuất người dùng sau khi đăng ký");
      
      try {
        console.log("Gửi email xác thực cho:", formData.email);
        await sendVerificationEmail({
          email: formData.email,
          name: formData.name,
          userId: userId,
          type: "email_verification"
        });
        
        console.log("Đã gửi email xác thực thành công");
        setShowVerificationDialog(true);
      } catch (emailError: any) {
        console.error("Lỗi gửi email xác thực:", emailError);
        toast({
          title: "Cảnh báo",
          description: "Đã tạo tài khoản nhưng không thể gửi email xác thực. Vui lòng liên hệ hỗ trợ.",
          variant: "destructive"
        });
        navigate("/verify-email-prompt");
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

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const closeVerificationDialog = () => {
    setShowVerificationDialog(false);
    navigate("/verify-email-prompt");
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
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPasswords.password ? "text" : "password"}
              placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('password')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPasswords.password ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showPasswords.confirmPassword ? "text" : "password"}
              placeholder="Nhập lại mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={8}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirmPassword')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              tabIndex={-1}
            >
              {showPasswords.confirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
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
