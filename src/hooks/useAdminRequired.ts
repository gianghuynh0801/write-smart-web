
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { adminRoleService } from "@/services/auth/adminRoleService";

export const useAdminRequired = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLocalChecking, setIsLocalChecking] = useState(true);
  const isMounted = useRef(true);
  const { 
    user, 
    session, 
    isAdmin, 
    isChecking, 
    refreshSession, 
    checkAdminStatus 
  } = useAuth();

  useEffect(() => {
    isMounted.current = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkAdminAccess = async () => {
      try {
        console.log("Đang kiểm tra session và quyền admin...");
        
        if (!session || !user) {
          console.log("Chưa đăng nhập, chuyển hướng đến trang đăng nhập admin");
          toast({
            title: "Truy cập bị từ chối",
            description: "Vui lòng đăng nhập để tiếp tục.",
            variant: "destructive"
          });
          navigate("/admin-login");
          return;
        }

        console.log("Đã tìm thấy session, user ID:", user.id);
        
        // Xóa cache để đảm bảo luôn kiểm tra lại quyền admin từ database
        adminRoleService.clearCache(user.id);
        
        // Kiểm tra vai trò admin - sử dụng adminRoleService
        const isUserAdmin = await checkAdminStatus(user.id);

        if (!isUserAdmin) {
          console.log("Không có quyền admin, chuyển hướng đến trang đăng nhập");
          toast({
            title: "Truy cập bị từ chối",
            description: "Bạn không có quyền truy cập trang này.",
            variant: "destructive"
          });
          
          navigate("/admin-login");
          return;
        }

        console.log("Xác thực quyền admin thành công");
        
        if (isMounted.current) {
          setIsLocalChecking(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra quyền admin:", error);
        
        // Thử làm mới session nếu có lỗi
        const refreshSuccessful = await refreshSession();
        
        if (!refreshSuccessful && retryCount < maxRetries && isMounted.current) {
          retryCount++;
          console.log(`Thử lại lần ${retryCount}/${maxRetries}...`);
          setTimeout(checkAdminAccess, 1000);
          return;
        } else if (!refreshSuccessful) {
          if (isMounted.current) {
            toast({
              title: "Lỗi hệ thống",
              description: "Không thể xác thực quyền truy cập. Vui lòng đăng nhập lại.",
              variant: "destructive"
            });
            navigate("/admin-login");
          }
        }
      } finally {
        if (isMounted.current) {
          setIsLocalChecking(false);
        }
      }
    };

    if (!isChecking) {
      checkAdminAccess();
    } else {
      // Nếu AuthContext đang kiểm tra, chờ nó hoàn thành
      setIsLocalChecking(true);
    }

    return () => {
      isMounted.current = false;
    };
  }, [navigate, toast, user, session, isChecking, isAdmin, refreshSession, checkAdminStatus]);

  return { 
    isChecking: isChecking || isLocalChecking, 
    isAdmin 
  };
};
