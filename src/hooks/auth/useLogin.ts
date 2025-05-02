
import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmailVerification } from "./useEmailVerification";
import { useLoginSubmit } from "./useLoginSubmit";
import { useSessionCheck } from "./useSessionCheck";
import { useAuthListener } from "./useAuthListener";

export function useLogin() {
  // Tạo state nội bộ cho email chưa xác thực
  const [localUnconfirmedEmail, setLocalUnconfirmedEmail] = useState<string>("");
  const [localIsEmailVerificationRequired, setLocalIsEmailVerificationRequired] = useState<boolean>(false);
  const [isEmailVerificationLoading, setIsEmailVerificationLoading] = useState<boolean>(false);
  
  // Truy cập đầy đủ các thuộc tính và phương thức từ useEmailVerification
  const emailVerification = useEmailVerification();
  
  // Sử dụng thuộc tính từ emailVerification nếu có, nếu không sử dụng state local
  const unconfirmedEmail = emailVerification.unconfirmedEmail || localUnconfirmedEmail;
  const setUnconfirmedEmail = emailVerification.setUnconfirmedEmail || setLocalUnconfirmedEmail;
  const isEmailVerificationRequired = emailVerification.isEmailVerificationRequired || localIsEmailVerificationRequired;
  const setIsEmailVerificationRequired = emailVerification.setIsEmailVerificationRequired || setLocalIsEmailVerificationRequired;
  const emailVerificationLoading = emailVerification.isLoading || isEmailVerificationLoading;
  const setEmailVerificationLoading = emailVerification.setIsLoading || setIsEmailVerificationLoading;
  
  // Tạo hàm fallback nếu không có hàm tương ứng trong emailVerification
  const fetchEmailVerificationConfig = emailVerification.fetchEmailVerificationConfig || 
    (() => Promise.resolve());
  const handleResendVerification = emailVerification.handleResendVerification || 
    (() => Promise.resolve({ success: false, data: null }));

  const { 
    isLoading: loginLoading, 
    error,
    redirectInProgress: loginRedirectInProgress,
    setRedirectInProgress: setLoginRedirectInProgress,
    handleLogin: submitLogin 
  } = useLoginSubmit();

  const {
    redirectInProgress: sessionRedirectInProgress,
    setRedirectInProgress: setSessionRedirectInProgress,
    checkSession
  } = useSessionCheck();

  // Kết hợp trạng thái redirectInProgress từ các hook con
  const redirectInProgress = loginRedirectInProgress || sessionRedirectInProgress;
  const setRedirectInProgress = (value: boolean) => {
    setLoginRedirectInProgress(value);
    setSessionRedirectInProgress(value);
  };

  // Kết hợp trạng thái loading từ các hook con
  const isLoading = emailVerificationLoading || loginLoading;

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
