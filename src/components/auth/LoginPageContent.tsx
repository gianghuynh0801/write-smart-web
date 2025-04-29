
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginContainer from "@/components/auth/LoginContainer";
import AuthLinks from "@/components/auth/AuthLinks";
import ResendVerificationButton from "@/components/auth/ResendVerificationButton";
import { useLogin } from "@/hooks/auth/useLogin";
import { useAuthListener } from "@/hooks/auth/useAuthListener";

const LoginPageContent: React.FC = () => {
  const {
    isLoading,
    error,
    unconfirmedEmail,
    redirectInProgress,
    fetchEmailVerificationConfig,
    checkSession,
    handleResendVerification,
    handleLogin,
    setRedirectInProgress
  } = useLogin();

  // Fetch email verification system configuration on component mount
  useEffect(() => {
    fetchEmailVerificationConfig();
  }, []);

  // Add check for existing session
  useEffect(() => {
    checkSession();
  }, []);

  return (
    <LoginContainer>
      <LoginHeader />
      <LoginForm 
        onSubmit={handleLogin}
        isLoading={isLoading}
        error={error}
      />
      {unconfirmedEmail && (
        <div className="mt-4 text-center">
          <p className="text-sm text-red-500">Email chưa được xác thực.</p>
          <ResendVerificationButton
            email={unconfirmedEmail}
            isLoading={isLoading}
            onResend={handleResendVerification}
          />
        </div>
      )}
      <AuthLinks />
    </LoginContainer>
  );
};

export default LoginPageContent;
