
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

  const handleAdminLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Kiểm tra xem username có phải là admin không
      if (username === defaultAdmin.username && password === defaultAdmin.password) {
        console.log("Đăng nhập với tài khoản admin mặc định");
        
        let authUser = null;
        
        // Dùng email từ cấu hình defaultAdmin để đăng nhập với Supabase
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: defaultAdmin.email,
          password: defaultAdmin.password,
        });

        if (signInError && signInError.message.includes("Invalid login credentials")) {
          console.log("Tài khoản admin chưa tồn tại, đăng ký mới");
          authUser = await createAdminAccount();
        } else if (signInError) {
          throw signInError;
        } else {
          authUser = signInData.user;
        }

        if (!authUser) throw new Error("Không tìm thấy thông tin người dùng");
        
        await setupAdminUser(authUser);
        
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
