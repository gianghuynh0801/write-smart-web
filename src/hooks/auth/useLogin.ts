
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmailVerification } from "./useEmailVerification";
import { useLoginSubmit } from "./useLoginSubmit";
import { useAuthListener } from "./useAuthListener";
import { supabase } from "@/integrations/supabase/client";

export function useLogin() {
  const [redirectInProgress, setRedirectInProgress] = useState<boolean>(false);
  const navigate = useNavigate();

  const { 
    unconfirmedEmail, 
    setUnconfirmedEmail,
    isEmailVerificationRequired, 
    setIsEmailVerificationRequired,
    isLoading: emailVerificationLoading,
    setIsLoading: setEmailVerificationLoading,
    fetchEmailVerificationConfig, 
    handleResendVerification 
  } = useEmailVerification();

  const { 
    isLoading: loginLoading, 
    error, 
    handleLogin: submitLogin 
  } = useLoginSubmit();

  // Kết hợp trạng thái loading từ các hook con
  const isLoading = emailVerificationLoading || loginLoading;

  // Kiểm tra phiên làm việc hiện tại
  const checkSession = async () => {
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
  };

  // Xử lý đăng nhập - gọi đến xử lý con trong useLoginSubmit
  const handleLogin = async (email: string, password: string) => {
    await submitLogin(
      email, 
      password, 
      isEmailVerificationRequired, 
      setUnconfirmedEmail,
      setRedirectInProgress
    );
  };

  // Sử dụng hook lắng nghe trạng thái auth
  useAuthListener(redirectInProgress, setRedirectInProgress);

  return {
    isLoading,
    error,
    unconfirmedEmail,
    isEmailVerificationRequired,
    redirectInProgress,
    setRedirectInProgress,
    fetchEmailVerificationConfig,
    checkSession,
    handleResendVerification,
    handleLogin
  };
}
