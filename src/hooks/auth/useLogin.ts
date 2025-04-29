
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEmailVerification } from "./useEmailVerification";
import { useLoginSubmit } from "./useLoginSubmit";
import { useSessionCheck } from "./useSessionCheck";
import { useAuthListener } from "./useAuthListener";

export function useLogin() {
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
