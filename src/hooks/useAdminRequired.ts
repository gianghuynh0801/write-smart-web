
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { checkAdminRole } from "@/services/admin/adminService";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

export const useAdminRequired = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkAdminAccess = async () => {
      try {
        console.log("Đang kiểm tra session và quyền admin...");
        setIsChecking(true);
        
        // Lấy session hiện tại
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Lỗi khi lấy session:", sessionError);
          throw new Error("Không thể truy xuất phiên đăng nhập");
        }

        if (!session) {
          console.log("Chưa đăng nhập, chuyển hướng đến trang đăng nhập admin");
          toast({
            title: "Truy cập bị từ chối",
            description: "Vui lòng đăng nhập để tiếp tục.",
            variant: "destructive"
          });
          navigate("/admin-login");
          return;
        }

        console.log("Đã tìm thấy session, user ID:", session.user.id);
        
        // Lưu access token vào localStorage để sử dụng cho các request yêu cầu xác thực
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);

        // Kiểm tra vai trò admin
        const { roleData, roleError } = await checkAdminRole(session.user.id);

        if (roleError) {
          console.error("Lỗi khi kiểm tra quyền admin:", roleError);
          throw new Error("Không thể xác thực quyền quản trị");
        }

        if (!roleData) {
          console.log("Không có quyền admin, chuyển hướng đến trang đăng nhập");
          toast({
            title: "Truy cập bị từ chối",
            description: "Bạn không có quyền truy cập trang này.",
            variant: "destructive"
          });
          
          // Đăng xuất và chuyển hướng
          await supabase.auth.signOut();
          navigate("/admin-login");
          return;
        }

        console.log("Xác thực quyền admin thành công");
        
        if (isMounted) {
          setIsAdmin(true);
          setIsChecking(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra quyền admin:", error);
        
        // Thử lại nếu số lần thử chưa vượt quá giới hạn
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          console.log(`Thử lại lần ${retryCount}/${maxRetries}...`);
          setTimeout(checkAdminAccess, 1000);
          return;
        }
        
        if (isMounted) {
          toast({
            title: "Lỗi hệ thống",
            description: error instanceof Error ? error.message : "Không thể xác thực quyền truy cập.",
            variant: "destructive"
          });
          setIsChecking(false);
          navigate("/admin-login");
        }
      }
    };

    checkAdminAccess();

    // Thiết lập lắng nghe sự kiện thay đổi trạng thái xác thực
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Sự kiện auth thay đổi:", event);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("Người dùng đã đăng xuất hoặc session đã hết hạn");
        if (isMounted) {
          setIsAdmin(false);
          navigate("/admin-login");
        }
      } else if (event === 'TOKEN_REFRESHED') {
        console.log("Token đã được làm mới");
        if (session.access_token) {
          setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { isChecking, isAdmin };
};
