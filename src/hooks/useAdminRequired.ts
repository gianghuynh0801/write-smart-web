
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";

export const useAdminRequired = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLocalChecking, setIsLocalChecking] = useState(true);
  const isMounted = useRef(true);
  const retryRef = useRef(0);
  
  // Sử dụng hook useAuth để truy cập AuthContext
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
        
        // Kiểm tra trực tiếp từ bảng seo_project.users trước
        try {
          const { data: userData, error: userError } = await supabase
            .from('seo_project.users')
            .select('role')
            .eq('id', user.id)
            .maybeSingle();
            
          if (!userError && userData?.role === 'admin') {
            console.log("Xác thực quyền admin thành công từ seo_project.users");
            if (isMounted.current) {
              setIsLocalChecking(false);
            }
            return;
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra seo_project.users:", error);
        }
        
        // Nếu không tìm thấy trong seo_project.users, thử với bảng seo_project.user_roles
        try {
          const { data: roleData, error: roleError } = await supabase
            .from('seo_project.user_roles')
            .select('*')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .maybeSingle();
            
          if (!roleError && roleData) {
            console.log("Xác thực quyền admin thành công từ seo_project.user_roles");
            if (isMounted.current) {
              setIsLocalChecking(false);
            }
            return;
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra seo_project.user_roles:", error);
        }
        
        // Nếu vẫn không tìm thấy, sử dụng phương thức của AuthContext
        const isUserAdmin = await checkAdminStatus(user.id);
        console.log("Kết quả kiểm tra quyền admin:", isUserAdmin);

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
        console.log("Làm mới session:", refreshSuccessful ? "thành công" : "thất bại");
        
        if (!refreshSuccessful && retryRef.current < maxRetries && isMounted.current) {
          retryRef.current++;
          console.log(`Thử lại lần ${retryRef.current}/${maxRetries}...`);
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
