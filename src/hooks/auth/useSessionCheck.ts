
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function useSessionCheck() {
  const [redirectInProgress, setRedirectInProgress] = useState<boolean>(false);
  const navigate = useNavigate();

  // Kiểm tra phiên làm việc hiện tại
  const checkSession = useCallback(async () => {
    console.log("Login: Kiểm tra phiên làm việc hiện tại");
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("Login: Phiên làm việc đã tồn tại, chuyển hướng đến dashboard");
      setRedirectInProgress(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      return true;
    }
    return false;
  }, [navigate]);

  return {
    redirectInProgress,
    setRedirectInProgress,
    checkSession
  };
}
