
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminRole } from "@/services/admin/adminService";

export function useSessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { roleData, roleError } = await checkAdminRole(user.id);

          if (roleData && !roleError) {
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

  return { isChecking };
}
