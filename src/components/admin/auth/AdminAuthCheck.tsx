
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AdminAuthCheckProps {
  onAuthSuccess: () => void;
}

export const AdminAuthCheck = ({ onAuthSuccess }: AdminAuthCheckProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndLoadUrl = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast({
            title: "Chưa đăng nhập",
            description: "Vui lòng đăng nhập với tài khoản quản trị.",
            variant: "destructive"
          });
          navigate("/admin/login");
          return;
        }

        // Check if current user is admin
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();

        if (roleError || !roleData) {
          toast({
            title: "Truy cập bị từ chối",
            description: "Bạn không có quyền truy cập trang này.",
            variant: "destructive"
          });
          navigate("/admin/login");
          return;
        }

        onAuthSuccess();
      } catch (error) {
        console.error('Lỗi kiểm tra quyền admin:', error);
        toast({
          title: "Lỗi hệ thống",
          description: "Không thể xác thực quyền truy cập.",
          variant: "destructive"
        });
      }
    };

    checkAdminAndLoadUrl();
  }, [navigate, toast, onAuthSuccess]);

  return null;
};
