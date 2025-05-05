
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

// Thông tin đăng nhập mặc định cho quản trị viên - đảm bảo phù hợp với dữ liệu thực tế
export const defaultAdmin = {
  username: "admin",
  email: "admin@example.com", // Email mặc định của admin
  password: "admin@1238"  // Mật khẩu mặc định cập nhật
};

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export const LoginForm = ({ onSubmit, isLoading = false, error }: LoginFormProps) => {
  const [email, setEmail] = useState(defaultAdmin.email);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Xử lý đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      console.log("Bắt đầu đăng nhập với email:", email);
      await onSubmit(email, password);
    } catch (error) {
      console.error("Lỗi trong quá trình đăng nhập:", error);
      toast({
        title: "Lỗi đăng nhập",
        description: "Đã xảy ra lỗi trong quá trình đăng nhập",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          Mật khẩu
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>
    </form>
  );
};

export default LoginForm;
