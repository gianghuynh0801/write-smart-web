
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAdminRequired = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        // Kiểm tra session hiện tại
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("Chưa đăng nhập");
          toast({
            title: "Truy cập bị từ chối",
            description: "Vui lòng đăng nhập để tiếp tục.",
            variant: "destructive"
          });
          navigate("/admin-login");
          return;
        }

        // Kiểm tra vai trò admin
        const { data: userData, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (error || !userData || userData.role !== "admin") {
          console.log("Không có quyền admin");
          toast({
            title: "Truy cập bị từ chối",
            description: "Bạn không có quyền truy cập trang này.",
            variant: "destructive"
          });
          
          // Đăng xuất và chuyển hướng về trang đăng nhập admin
          await supabase.auth.signOut();
          navigate("/admin-login");
          return;
        }

      } catch (error) {
        console.error("Lỗi kiểm tra quyền admin:", error);
        toast({
          title: "Lỗi hệ thống",
          description: "Không thể xác thực quyền truy cập.",
          variant: "destructive"
        });
        navigate("/admin-login");
      }
    };

    checkAdminAccess();
  }, [navigate, toast]);
};
