
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useAuthListener(redirectInProgress: boolean, setRedirectInProgress: (value: boolean) => void) {
  const navigate = useNavigate();

  // Sự kiện auth state change để chuyển hướng
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Login: Auth state changed:", event);
        
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && currentSession && !redirectInProgress) {
          console.log("Login: Phát hiện đăng nhập/token refreshed từ sự kiện auth, chuyển hướng đến dashboard");
          setRedirectInProgress(true);
          
          // Force chuyển hướng bằng window.location để đảm bảo refresh toàn bộ ứng dụng
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2000);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, redirectInProgress, setRedirectInProgress]);

  return {};
}
