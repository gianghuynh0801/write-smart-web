
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tài khoản admin mặc định
    const defaultAdmin = {
      username: "admin",
      password: "admin@1238"
    };
    
    if (formData.username === defaultAdmin.username && formData.password === defaultAdmin.password) {
      // Lưu thông tin đăng nhập admin vào localStorage (trong thực tế nên dùng JWT/session)
      localStorage.setItem("adminAuth", JSON.stringify({ 
        isAdmin: true, 
        username: formData.username,
        token: "admin-mock-token-" + Date.now() // Mock token
      }));
      
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
          
          <Button type="submit" className="w-full">
            Đăng nhập
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
