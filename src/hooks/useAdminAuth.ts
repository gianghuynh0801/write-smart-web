
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createAdminAccount, defaultAdmin, setupAdminUser } from "@/services/admin/adminService";
import { useSessionCheck } from "./useSessionCheck";

export { defaultAdmin } from "@/services/admin/adminService";

export const useAdminAuth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { isChecking } = useSessionCheck();

  const handleAdminLogin = async (usernameOrEmail: string, password: string) => {
    setIsLoading(true);
    try {
      // Kiểm tra xem đăng nhập bằng username hay email
      const isDefaultAdmin = 
        (usernameOrEmail === defaultAdmin.username || usernameOrEmail === defaultAdmin.email) && 
        password === defaultAdmin.password;

      if (isDefaultAdmin) {
        console.log("Đăng nhập với tài khoản admin mặc định");
        
        // Luôn dùng email từ cấu hình defaultAdmin để đăng nhập với Supabase
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: defaultAdmin.email,
          password: defaultAdmin.password,
        });

        if (signInError) {
          if (signInError.message.includes("Invalid login credentials")) {
            console.log("Tài khoản admin chưa tồn tại, đăng ký mới");
            const authUser = await createAdminAccount();
            
            if (!authUser) throw new Error("Không thể tạo tài khoản admin");
            
            await setupAdminUser(authUser);
            
            // Sau khi tạo tài khoản và thiết lập, đăng nhập lại
            const { data: reSignInData, error: reSignInError } = await supabase.auth.signInWithPassword({
              email: defaultAdmin.email,
              password: defaultAdmin.password,
            });
            
            if (reSignInError) throw reSignInError;
            
            if (!reSignInData.user) throw new Error("Đăng nhập thất bại sau khi tạo tài khoản");
            
            toast({
              title: "Đăng nhập thành công",
              description: "Đã tạo và thiết lập tài khoản admin mới.",
            });
            
            navigate("/admin");
            return;
          } else {
            throw signInError;
          }
        }

        if (!signInData.user) throw new Error("Không tìm thấy thông tin người dùng");
        
        await setupAdminUser(signInData.user);
        
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

  return { isLoading, isChecking, handleAdminLogin };
};
