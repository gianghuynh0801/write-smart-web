
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";
import { useAuth } from "@/contexts/auth"; // Sửa import path

export function useSessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    user, 
    session, 
    isAdmin, 
    isChecking, 
    refreshSession, 
    checkAdminStatus 
  } = useAuth();

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkAdminSession = async () => {
      try {
        console.log("Kiểm tra phiên đăng nhập admin...");
        
        if (!session || !user) {
          console.log("Chưa đăng nhập");
          if (isMounted) {
            navigate("/admin-login");
          }
          return;
        }
        
        console.log("Đã tìm thấy người dùng:", user.email);
        
        // Lưu token vào localStorage
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
        
        const isUserAdmin = await checkAdminStatus(user.id);

        if (isUserAdmin) {
          console.log("Xác thực quyền admin thành công");
          if (isMounted) {
            toast({
              title: "Đã đăng nhập",
              description: "Bạn đã đăng nhập với quyền quản trị.",
            });
            navigate("/admin");
          }
          return;
        } else {
          console.log("Người dùng không có quyền admin");
          if (isMounted) {
            // Chuyển hướng về trang đăng nhập admin
            toast({
              title: "Truy cập bị từ chối",
              description: "Bạn không có quyền truy cập trang quản trị.",
              variant: "destructive"
            });
            navigate("/admin-login");
          }
        }
      } catch (error) {
        console.error('Lỗi kiểm tra phiên đăng nhập:', error);
        
        // Thử làm mới session nếu có lỗi
        const refreshSuccessful = await refreshSession();
        
        if (!refreshSuccessful && retryCount < maxRetries && isMounted) {
          retryCount++;
          console.log(`Thử lại lần ${retryCount}/${maxRetries}...`);
          setTimeout(checkAdminSession, 1000);
          return;
        } else if (!refreshSuccessful) {
          if (isMounted) {
            toast({
              title: "Lỗi xác thực",
              description: "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.",
              variant: "destructive"
            });
            navigate("/admin-login");
          }
        }
      }
    };
    
    if (!isChecking) {
      checkAdminSession();
    }

    return () => {
      isMounted = false;
    };
  }, [navigate, toast, user, session, isChecking, isAdmin, refreshSession, checkAdminStatus]);

  return { isChecking, isAdmin };
}
