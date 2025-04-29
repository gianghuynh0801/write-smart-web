
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAuthRedirect(redirectTo: string = '/login') {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("useAuthRedirect: Kiểm tra trạng thái xác thực");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log("useAuthRedirect: Không có phiên làm việc, chuyển hướng đến:", redirectTo);
          navigate(redirectTo);
        } else {
          console.log("useAuthRedirect: Đã có phiên làm việc, user:", session.user.id);
        }
      } catch (error) {
        console.error("useAuthRedirect: Lỗi khi kiểm tra xác thực:", error);
        navigate(redirectTo);
      } finally {
        setIsChecking(false);
      }
    };

    // Thêm delay nhỏ để đảm bảo phiên làm việc đã được cập nhật đầy đủ
    const initialCheckTimeout = setTimeout(() => {
      checkAuth();
    }, 500);

    // Theo dõi thay đổi trạng thái xác thực
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("useAuthRedirect: Sự kiện auth thay đổi:", event);
      
      if (event === 'SIGNED_OUT' || !session) {
        console.log("useAuthRedirect: Người dùng đã đăng xuất hoặc phiên không tồn tại");
        navigate(redirectTo);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        console.log("useAuthRedirect: Người dùng đã đăng nhập hoặc token được làm mới");
      }
    });

    return () => {
      clearTimeout(initialCheckTimeout);
      subscription.unsubscribe();
    };
  }, [navigate, redirectTo]);

  return { isChecking };
}
