
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useEmailVerification() {
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>("");
  const [isEmailVerificationRequired, setIsEmailVerificationRequired] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Hàm để lấy cấu hình xác thực email
  const fetchEmailVerificationConfig = async () => {
    const { data, error } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', 'require_email_verification')
      .maybeSingle();
    
    if (!error && data) {
      setIsEmailVerificationRequired(data.value === 'true');
    }
  };

  // Gửi lại email xác thực
  const handleResendVerification = async () => {
    if (!unconfirmedEmail) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: unconfirmedEmail,
      });
      
      if (error) throw error;
      
      toast({
        title: "Đã gửi email xác thực",
        description: "Vui lòng kiểm tra hộp thư của bạn để xác thực tài khoản.",
      });
    } catch (error: any) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi lại email xác thực. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    unconfirmedEmail,
    setUnconfirmedEmail,
    isEmailVerificationRequired,
    setIsEmailVerificationRequired,
    isLoading,
    setIsLoading,
    fetchEmailVerificationConfig,
    handleResendVerification
  };
}
