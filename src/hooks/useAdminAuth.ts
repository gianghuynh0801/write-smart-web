
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Thông tin đăng nhập mặc định cho quản trị viên
export const defaultAdmin = {
  username: "admin",
  email: "admin@example.com",
  password: "Admin123!"
};

export const useAdminAuth = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hàm kiểm tra quyền admin
  const checkAdminAccess = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Lấy session hiện tại
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session || !sessionData.session.user) {
        console.log("Không có user, chuyển hướng đến trang đăng nhập");
        navigate("/admin-login");
        return false;
      }
      
      const userId = sessionData.session.user.id;
      console.log("Kiểm tra quyền admin cho user:", userId);
      
      // Kiểm tra quyền admin trong bảng seo_project.users trước
      const { data: seoProjectUser, error: seoProjectError } = await supabase
        .from('seo_project.users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
        
      if (!seoProjectError && seoProjectUser?.role === 'admin') {
        console.log("Đã tìm thấy quyền admin trong seo_project.users");
        return true;
      }
      
      // Kiểm tra quyền admin trong bảng seo_project.user_roles
      const { data: seoProjectRole, error: seoProjectRoleError } = await supabase
        .from('seo_project.user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (!seoProjectRoleError && seoProjectRole) {
        console.log("Đã tìm thấy quyền admin trong seo_project.user_roles");
        return true;
      }
      
      console.log("User không có quyền admin");
      toast({
        title: "Truy cập bị từ chối",
        description: "Bạn không có quyền truy cập trang quản trị",
        variant: "destructive",
      });
      
      navigate("/admin-login");
      return false;
    } catch (error: any) {
      console.error("Lỗi không xác định khi kiểm tra quyền admin:", error);
      setError("Đã xảy ra lỗi không mong muốn");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [navigate, toast]);

  // Kiểm tra quyền admin khi hook được gọi
  useEffect(() => {
    checkAdminAccess();
  }, [checkAdminAccess]);

  return {
    isLoading,
    error,
    checkAdminAccess
  };
};

export default useAdminAuth;
