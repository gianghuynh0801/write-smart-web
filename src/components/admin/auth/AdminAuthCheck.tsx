
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminRole } from "@/services/admin/adminService";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

interface AdminAuthCheckProps {
  onAuthSuccess: () => void;
}

export const AdminAuthCheck = ({ onAuthSuccess }: AdminAuthCheckProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  const isMounted = useRef(true);
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    isMounted.current = true;
    
    const checkAdminAndLoadUrl = async () => {
      try {
        console.log("Kiểm tra quyền admin...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Lỗi khi lấy session:", sessionError);
          throw new Error("Không thể truy xuất phiên đăng nhập");
        }
        
        if (!session) {
          console.log("Chưa đăng nhập");
          if (isMounted.current) {
            toast({
              title: "Chưa đăng nhập",
              description: "Vui lòng đăng nhập với tài khoản quản trị.",
              variant: "destructive"
            });
            navigate("/admin/login");
          }
          return;
        }

        console.log("User ID:", session.user.id);
        
        // Lưu token vào localStorage
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);

        // Kiểm tra quyền admin
        const { roleData, roleError } = await checkAdminRole(session.user.id);

        console.log("Role data:", roleData, "Role error:", roleError);

        if (roleError || !roleData) {
          console.log("Không có quyền admin");
          if (isMounted.current) {
            toast({
              title: "Truy cập bị từ chối",
              description: "Bạn không có quyền truy cập trang này.",
              variant: "destructive"
            });
            
            // Đăng xuất người dùng không có quyền admin
            await supabase.auth.signOut();
            navigate("/admin/login");
          }
          return;
        }

        console.log("Xác thực admin thành công");
        if (isMounted.current) {
          onAuthSuccess();
        }
      } catch (error) {
        console.error('Lỗi kiểm tra quyền admin:', error);
        
        // Thử lại nếu chưa vượt quá số lần cho phép
        if (retryCount.current < maxRetries && isMounted.current) {
          retryCount.current++;
          console.log(`Thử lại lần ${retryCount.current}/${maxRetries}...`);
          setTimeout(checkAdminAndLoadUrl, 1000 * retryCount.current);
          return;
        }
        
        if (isMounted.current) {
          toast({
            title: "Lỗi hệ thống",
            description: "Không thể xác thực quyền truy cập.",
            variant: "destructive"
          });
          navigate("/admin/login");
        }
      } finally {
        if (isMounted.current) {
          setIsChecking(false);
        }
      }
    };

    checkAdminAndLoadUrl();

    // Lắng nghe sự kiện thay đổi trạng thái xác thực
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        console.log("Người dùng đã đăng xuất hoặc session đã hết hạn");
        if (isMounted.current) {
          navigate("/admin/login");
        }
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log("Token đã được làm mới");
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
      }
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast, onAuthSuccess]);

  // Hiển thị màn hình loading nếu đang kiểm tra
  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return null;
};
