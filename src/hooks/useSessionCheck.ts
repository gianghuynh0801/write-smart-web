
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { checkAdminRole } from "@/services/admin/adminService";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

export function useSessionCheck() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const checkAdminSession = async () => {
      try {
        console.log("Kiểm tra phiên đăng nhập admin...");
        const { data: { user, session }, error: sessionError } = await supabase.auth.getUser();
        
        if (sessionError) {
          console.error("Lỗi khi lấy thông tin session:", sessionError);
          throw new Error("Không thể truy xuất phiên đăng nhập");
        }
        
        if (user && session) {
          console.log("Đã tìm thấy người dùng:", user.email);
          
          // Lưu token vào localStorage
          setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
          
          const { roleData, roleError } = await checkAdminRole(user.id);

          if (roleData && !roleError) {
            console.log("Xác thực quyền admin thành công");
            if (isMounted) {
              setIsAdmin(true);
              toast({
                title: "Đã đăng nhập",
                description: "Bạn đã đăng nhập với quyền quản trị.",
              });
              navigate("/admin");
            }
            return;
          } else {
            console.log("Người dùng không có quyền admin:", roleError);
            if (isMounted) {
              // Đăng xuất người dùng không có quyền admin
              await supabase.auth.signOut();
            }
          }
        } else {
          console.log("Chưa đăng nhập");
        }
      } catch (error) {
        console.error('Lỗi kiểm tra phiên đăng nhập:', error);
        
        // Thử lại nếu chưa vượt quá số lần
        if (retryCount < maxRetries && isMounted) {
          retryCount++;
          console.log(`Thử lại lần ${retryCount}/${maxRetries}...`);
          setTimeout(checkAdminSession, 1000);
          return;
        }
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    // Thiết lập lắng nghe sự kiện thay đổi trạng thái xác thực
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Sự kiện auth thay đổi:", event);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Người dùng đã đăng nhập, lưu token");
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
        checkAdminSession();
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log("Token đã được làm mới");
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
      } else if (event === 'SIGNED_OUT') {
        console.log("Người dùng đã đăng xuất");
        if (isMounted) {
          setIsAdmin(false);
        }
      }
    });

    checkAdminSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { isChecking, isAdmin };
}
