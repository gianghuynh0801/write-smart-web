
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminRole } from "@/services/admin/adminService";

export function useSessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminSession = async () => {
      try {
        console.log("Kiểm tra phiên đăng nhập admin...");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("Đã tìm thấy người dùng:", user.email);
          const { roleData, roleError } = await checkAdminRole(user.id);

          if (roleData && !roleError) {
            console.log("Xác thực quyền admin thành công");
            setIsAdmin(true);
            toast({
              title: "Đã đăng nhập",
              description: "Bạn đã đăng nhập với quyền quản trị.",
            });
            navigate("/admin");
            return;
          } else {
            console.log("Người dùng không có quyền admin");
          }
        } else {
          console.log("Chưa đăng nhập");
        }
      } catch (error) {
        console.error('Lỗi kiểm tra phiên đăng nhập:', error);
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminSession();
  }, [navigate, toast]);

  return { isChecking, isAdmin };
}
