
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useEmailVerification() {
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>("");
  const [isEmailVerificationRequired, setIsEmailVerificationRequired] = useState<boolean>(false); // Mặc định là false
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Hàm để lấy cấu hình xác thực email
  const fetchEmailVerificationConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'require_email_verification')
        .maybeSingle();
      
      if (error) {
        console.error("Lỗi khi lấy cấu hình xác thực email:", error);
        // Nếu không có cấu hình, mặc định là không yêu cầu xác thực email
        setIsEmailVerificationRequired(false);
        return;
      }
      
      // Nếu có dữ liệu thì sử dụng, nếu không thì mặc định là false
      setIsEmailVerificationRequired(data?.value === 'true');
      
      console.log("Cấu hình xác thực email:", data?.value, "Yêu cầu xác thực:", data?.value === 'true');
    } catch (error) {
      console.error("Lỗi không xác định khi lấy cấu hình:", error);
      // Trong trường hợp lỗi, mặc định là không yêu cầu xác thực email
      setIsEmailVerificationRequired(false);
    }
  };

  // Gọi fetchEmailVerificationConfig khi component được mount
  useEffect(() => {
    fetchEmailVerificationConfig();
  }, []);

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
