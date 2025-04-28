
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface AdminAuthCheckProps {
  onAuthSuccess: () => void;
}

export const AdminAuthCheck = ({ onAuthSuccess }: AdminAuthCheckProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLocalChecking, setIsLocalChecking] = useState(true);
  const isMounted = useRef(true);
  const retryCount = useRef(0);
  const maxRetries = 3;
  const { 
    user, 
    session, 
    isChecking, 
    refreshSession, 
    checkAdminStatus 
  } = useAuth();

  useEffect(() => {
    isMounted.current = true;
    
    const checkAdminAndLoadUrl = async () => {
      try {
        console.log("Kiểm tra quyền admin...");
        
        if (!session || !user) {
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

        console.log("User ID:", user.id);
        
        // Kiểm tra quyền admin
        const isAdmin = await checkAdminStatus(user.id);

        if (!isAdmin) {
          console.log("Không có quyền admin");
          if (isMounted.current) {
            toast({
              title: "Truy cập bị từ chối",
              description: "Bạn không có quyền truy cập trang này.",
              variant: "destructive"
            });
            
            navigate("/admin/login");
          }
          return;
        }

        console.log("Xác thực admin thành công");
        if (isMounted.current) {
          onAuthSuccess();
          setIsLocalChecking(false);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra quyền admin:', error);
        
        // Thử làm mới session nếu có lỗi
        const refreshSuccessful = await refreshSession();
        
        if (!refreshSuccessful && retryCount.current < maxRetries && isMounted.current) {
          retryCount.current++;
          console.log(`Thử lại lần ${retryCount.current}/${maxRetries}...`);
          setTimeout(checkAdminAndLoadUrl, 1000 * retryCount.current);
          return;
        } else if (!refreshSuccessful) {
          if (isMounted.current) {
            toast({
              title: "Lỗi hệ thống",
              description: "Không thể xác thực quyền truy cập.",
              variant: "destructive"
            });
            navigate("/admin/login");
          }
        }
      } finally {
        if (isMounted.current) {
          setIsLocalChecking(false);
        }
      }
    };

    if (!isChecking) {
      checkAdminAndLoadUrl();
    }

    return () => {
      isMounted.current = false;
    };
  }, [navigate, toast, onAuthSuccess, user, session, isChecking, refreshSession, checkAdminStatus]);

  // Hiển thị màn hình loading nếu đang kiểm tra
  if (isChecking || isLocalChecking) {
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
