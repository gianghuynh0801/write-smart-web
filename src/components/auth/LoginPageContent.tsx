
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoginForm } from "@/components/auth/LoginForm";
import LoginHeader from "@/components/auth/LoginHeader";
import LoginContainer from "@/components/auth/LoginContainer";
import AuthLinks from "@/components/auth/AuthLinks";
import ResendVerificationButton from "@/components/auth/ResendVerificationButton";
import { useLogin } from "@/hooks/useLogin";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  
  const navigate = useNavigate();

  // Fetch email verification system configuration on component mount
  useEffect(() => {
    fetchEmailVerificationConfig();
  }, []);

  // Add check for existing session
  useEffect(() => {
    checkSession();
  }, []);
  
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
  }, [navigate, redirectInProgress]);

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
