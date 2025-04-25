
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminRole } from "@/services/admin/adminService";

interface AdminAuthCheckProps {
  onAuthSuccess: () => void;
}

export const AdminAuthCheck = ({ onAuthSuccess }: AdminAuthCheckProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminAndLoadUrl = async () => {
      try {
        console.log("Kiểm tra quyền admin...");
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("Chưa đăng nhập");
          toast({
            title: "Chưa đăng nhập",
            description: "Vui lòng đăng nhập với tài khoản quản trị.",
            variant: "destructive"
          });
          navigate("/admin/login");
          return;
        }

        console.log("User ID:", user.id);

        // Check if current user is admin
        const { roleData, roleError } = await checkAdminRole(user.id);

        console.log("Role data:", roleData, "Role error:", roleError);

        if (roleError || !roleData) {
          console.log("Không có quyền admin");
          toast({
            title: "Truy cập bị từ chối",
            description: "Bạn không có quyền truy cập trang này.",
            variant: "destructive"
          });
          
          // Sign out non-admin user
          await supabase.auth.signOut();
          navigate("/admin/login");
          return;
        }

        console.log("Xác thực admin thành công");
        onAuthSuccess();
      } catch (error) {
        console.error('Lỗi kiểm tra quyền admin:', error);
        toast({
          title: "Lỗi hệ thống",
          description: "Không thể xác thực quyền truy cập.",
          variant: "destructive"
        });
        navigate("/admin/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkAdminAndLoadUrl();
  }, [navigate, toast, onAuthSuccess]);

  return null;
};
