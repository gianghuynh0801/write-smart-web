
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useAdminRequired = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const isMounted = useRef(true);
  const retryRef = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    isMounted.current = true;

    const checkAdminAccess = async () => {
      try {
        console.log("Kiểm tra quyền admin...");
        
        // Lấy session hiện tại
        const { data: sessionData } = await supabase.auth.getSession();
        
        if (!sessionData.session || !sessionData.session.user) {
          console.log("Chưa đăng nhập");
          if (isMounted.current) {
            toast({
              title: "Chưa đăng nhập",
              description: "Vui lòng đăng nhập với tài khoản quản trị.",
              variant: "destructive"
            });
            navigate("/admin-login");
          }
          return;
        }

        console.log("User ID:", sessionData.session.user.id);
        
        // Kiểm tra quyền admin trong bảng seo_project.users trước
        const { data: userData, error: userError } = await supabase
          .from('seo_project.users')
          .select('role')
          .eq('id', sessionData.session.user.id)
          .maybeSingle();
          
        const isUserAdmin = !userError && userData?.role === 'admin';
        
        if (!isUserAdmin) {
          // Kiểm tra trong bảng user_roles
          const { data: roleData, error: roleError } = await supabase
            .from('seo_project.user_roles')
            .select('*')
            .eq('user_id', sessionData.session.user.id)
            .eq('role', 'admin')
            .maybeSingle();
            
          if (roleError || !roleData) {
            console.log("Không có quyền admin");
            if (isMounted.current) {
              toast({
                title: "Truy cập bị từ chối",
                description: "Bạn không có quyền truy cập trang này.",
                variant: "destructive"
              });
              
              navigate("/admin-login");
            }
            return;
          }
        }

        console.log("Xác thực admin thành công");
        if (isMounted.current) {
          setIsAdmin(true);
          setIsChecking(false);
        }
      } catch (error) {
        console.error('Lỗi kiểm tra quyền admin:', error);
        
        // Thử lại nếu có lỗi
        if (retryRef.current < maxRetries && isMounted.current) {
          retryRef.current++;
          console.log(`Thử lại lần ${retryRef.current}/${maxRetries}...`);
          setTimeout(checkAdminAccess, 1000 * retryRef.current);
          return;
        } else {
          if (isMounted.current) {
            toast({
              title: "Lỗi hệ thống",
              description: "Không thể xác thực quyền truy cập.",
              variant: "destructive"
            });
            navigate("/admin-login");
          }
        }
      } finally {
        if (isMounted.current) {
          setIsChecking(false);
        }
      }
    };

    checkAdminAccess();

    return () => {
      isMounted.current = false;
    };
  }, [navigate, toast]);

  return { 
    isChecking, 
    isAdmin 
  };
};
