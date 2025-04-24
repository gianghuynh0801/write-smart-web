
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  // Check if user is already logged in as admin
  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if current user is admin
          const { data: roleData, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single();

          if (roleData && !roleError) {
            // User is already logged in as admin
            toast({
              title: "Đã đăng nhập",
              description: "Bạn đã đăng nhập với quyền quản trị.",
            });
            navigate("/admin");
            return;
          }
        }
      } catch (error) {
        console.error('Lỗi kiểm tra phiên đăng nhập:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminSession();
  }, [navigate, toast]);

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
        console.log("Đăng nhập với tài khoản admin mặc định");
        
        // Sign in with Supabase
        const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
          email: "admin@writesmart.vn",
          password: defaultAdmin.password,
        });

        // If user doesn't exist, sign up
        if (signInError && signInError.message.includes("Invalid login credentials")) {
          console.log("Tài khoản admin chưa tồn tại, đăng ký mới");
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: "admin@writesmart.vn",
            password: defaultAdmin.password,
          });

          if (signUpError) throw signUpError;
          if (!signUpData.user) throw new Error("Không thể tạo tài khoản admin");
          
          // Use the newly created user
          user = signUpData.user;
        } else if (signInError) {
          throw signInError;
        }

        if (!user) throw new Error("Không tìm thấy thông tin người dùng");
        
        console.log("Đăng nhập thành công, user ID:", user.id);

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

        if (userError) {
          console.error("Lỗi khi cập nhật user:", userError);
          throw userError;
        }

        console.log("Đã cập nhật thông tin user");

        // Check if role already exists to avoid duplicate
        const { data: existingRole } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (!existingRole) {
          // Insert admin role into user_roles table
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: "admin",
            });

          if (roleError) {
            console.error("Lỗi khi thêm vai trò admin:", roleError);
            throw roleError;
          }
          
          console.log("Đã thêm vai trò admin");
        } else {
          console.log("Vai trò admin đã tồn tại");
        }
        
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

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

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
