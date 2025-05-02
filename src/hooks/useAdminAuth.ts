
import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

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
      navigate("/admin/login");
      return false;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Kiểm tra quyền admin cho user:", auth.user.id);
      
      // Kiểm tra quyền admin trong bảng user_roles
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', auth.user.id as any)
        .eq('role', 'admin' as any)
        .maybeSingle();
        
      if (error) {
        console.error("Lỗi khi kiểm tra quyền admin:", error);
        setError("Không thể kiểm tra quyền truy cập");
        return false;
      }
      
      if (!data) {
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
