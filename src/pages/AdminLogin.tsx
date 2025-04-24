
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Tài khoản admin mặc định
      const defaultAdmin = {
        username: "admin",
        password: "admin@1238"
      };
      
      if (formData.username === defaultAdmin.username && formData.password === defaultAdmin.password) {
        // Sign up with Supabase if the user doesn't exist
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: "admin@writesmart.vn",
          password: defaultAdmin.password,
        });

        if (signUpError && signUpError.message !== "User already registered") {
          throw signUpError;
        }

        // Sign in with Supabase
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email: "admin@writesmart.vn",
          password: defaultAdmin.password,
        });

        if (signInError) throw signInError;
        if (!user) throw new Error("Không tìm thấy thông tin người dùng");

        // Insert or update user record
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email!,
            name: "Admin",
            role: "admin",
            status: "active",
          });

        if (userError) throw userError;

        // Insert admin role into user_roles table
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: user.id,
            role: "admin",
          });

        if (roleError) throw roleError;
        
        toast({
          title: "Đăng nhập thành công",
          description: "Chào mừng quay trở lại, Admin!",
        });
        
        navigate("/admin");
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: "Tên đăng nhập hoặc mật khẩu không chính xác",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi đăng nhập",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Quản trị viên</h1>
          <p className="text-gray-600">Đăng nhập vào hệ thống quản trị</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập
            </label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="admin"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Quay lại trang chủ?{" "}
            <a href="/" className="text-primary hover:underline">
              Trang chủ
            </a>
          </p>
        </div>

        {/* Thông tin tài khoản mặc định (chỉ cho mục đích demo) */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">Tài khoản mặc định:</p>
          <div className="text-sm text-gray-600">
            <p>Tên đăng nhập: <span className="font-mono bg-gray-200 px-1 rounded">admin</span></p>
            <p>Mật khẩu: <span className="font-mono bg-gray-200 px-1 rounded">admin@1238</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
