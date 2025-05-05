
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

// Thông tin đăng nhập mặc định cho quản trị viên - Xuất ra để LoginForm có thể sử dụng
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
  const auth = useAuth();
  
  // Hàm kiểm tra quyền admin
  const checkAdminAccess = useCallback(async () => {
    if (!auth.user) {
      console.log("Không có user, chuyển hướng đến trang đăng nhập");
      navigate("/admin-login");
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Kiểm tra quyền admin cho user:", auth.user.id);
      
      // Kiểm tra quyền admin trong bảng seo_project.users trước
      const { data: seoProjectUser, error: seoProjectError } = await supabase
        .from('seo_project.users')
        .select('role')
        .eq('id', auth.user.id)
        .maybeSingle();
        
      if (!seoProjectError && seoProjectUser?.role === 'admin') {
        console.log("Đã tìm thấy quyền admin trong seo_project.users");
        return true;
      }
      
      // Kiểm tra quyền admin trong bảng seo_project.user_roles
      const { data: seoProjectRole, error: seoProjectRoleError } = await supabase
        .from('seo_project.user_roles')
        .select('*')
        .eq('user_id', auth.user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (!seoProjectRoleError && seoProjectRole) {
        console.log("Đã tìm thấy quyền admin trong seo_project.user_roles");
        return true;
      }
      
      // Kiểm tra quyền admin trong bảng user_roles
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', auth.user.id)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (error && !error.message.includes("does not exist")) {
        console.error("Lỗi khi kiểm tra quyền admin:", error);
        setError("Không thể kiểm tra quyền truy cập");
        return false;
      }
      
      if (!data) {
        // Kiểm tra trong bảng users thông thường
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', auth.user.id)
          .maybeSingle();
          
        if (!userError && userData?.role === 'admin') {
          console.log("Đã tìm thấy quyền admin trong bảng users");
          return true;
        }
        
        console.log("User không có quyền admin");
        toast({
          title: "Truy cập bị từ chối",
          description: "Bạn không có quyền truy cập trang quản trị",
          variant: "destructive",
        });
        
        navigate("/");
        return false;
      }
      
      console.log("Xác thực quyền admin thành công");
      return true;
    } catch (error) {
      console.error("Lỗi không xác định khi kiểm tra quyền admin:", error);
      setError("Đã xảy ra lỗi không mong muốn");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [auth.user, navigate, toast]);

  // Kiểm tra quyền admin ngay khi component mount
  useEffect(() => {
    // Chỉ thực hiện kiểm tra khi đã hoàn thành việc kiểm tra session ban đầu
    if (!auth.isChecking) {
      checkAdminAccess();
    }
  }, [auth.isChecking, checkAdminAccess]);

  return {
    isLoading,
    error,
    checkAdminAccess
  };
};

export default useAdminAuth;
