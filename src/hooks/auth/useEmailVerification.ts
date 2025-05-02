
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/integrations/supabase/typeSafeClient";
import { useToast } from "@/hooks/use-toast";

export interface VerificationParams {
  email: string;
  name?: string;
  userId: string;
  type: "email_verification" | "password_reset";
}

// Kiểm tra xem lỗi có thể thử lại hay không
const isRetryableError = (error: any): boolean => {
  if (!error) return false;
  
  // Lỗi mạng hoặc kết nối
  if (error.message?.includes('network') || error.message?.includes('connect')) return true;
  
  // Lỗi timeout
  if (error.message?.includes('timeout') || error.message?.includes('timed out')) return true;
  
  // Lỗi database tạm thời
  if (error.message?.includes('temporarily unavailable') || 
      error.message?.includes('too many connections') ||
      error.message?.includes('resource busy')) return true;
  
  return false;
};

export const useEmailVerification = () => {
  const { toast } = useToast();
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string>("");
  const [isEmailVerificationRequired, setIsEmailVerificationRequired] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Lấy cấu hình xác minh email từ DB
  const fetchEmailVerificationConfig = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Đang lấy cấu hình xác minh email...");
      
      const { data, error } = await db.system_configurations()
        .select('value')
        .eq('key', 'require_email_verification')
        .maybeSingle();
      
      if (error) {
        console.error("Lỗi khi lấy cấu hình xác minh email:", error);
        setIsEmailVerificationRequired(false);
        return;
      }
      
      // Xử lý dữ liệu nhận được an toàn
      const configValue = data && typeof data === 'object' && 'value' in data ? data.value : null;
      const requireVerification = configValue === 'true';
      
      console.log("Cấu hình xác minh email:", requireVerification);
      setIsEmailVerificationRequired(requireVerification);
    } catch (error) {
      console.error("Lỗi không xác định khi lấy cấu hình email:", error);
      setIsEmailVerificationRequired(false);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Xử lý gửi lại email xác thực
  const handleResendVerification = useCallback(async () => {
    if (!unconfirmedEmail) {
      console.error("Email không hợp lệ khi thử gửi lại xác thực");
      toast({
        title: "Lỗi",
        description: "Email không hợp lệ hoặc thiếu.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Đang tìm user ID từ email:", unconfirmedEmail);
      
      // Tìm ID người dùng từ email
      const { data: userData, error: userError } = await db.users()
        .select("id")
        .eq("email", unconfirmedEmail.toLowerCase())
        .maybeSingle();
        
      if (userError || !userData) {
        console.error("Không tìm thấy người dùng với email:", unconfirmedEmail);
        toast({
          title: "Lỗi",
          description: "Không tìm thấy tài khoản với email này.",
          variant: "destructive",
        });
        return;
      }
      
      // Truy cập an toàn user ID
      const userId = userData && typeof userData === 'object' && 'id' in userData ? userData.id : null;
      
      if (!userId) {
        console.error("ID người dùng không hợp lệ");
        toast({
          title: "Lỗi",
          description: "ID người dùng không hợp lệ.",
          variant: "destructive",
        });
        return;
      }
      
      // Gọi API để gửi email xác thực
      await sendVerificationEmail({
        email: unconfirmedEmail,
        userId: userId as string,
        type: "email_verification"
      });
      
      toast({
        title: "Email xác thực đã được gửi",
        description: "Vui lòng kiểm tra hộp thư của bạn.",
      });
      
    } catch (error) {
      console.error("Lỗi khi gửi lại email xác thực:", error);
      toast({
        title: "Lỗi",
        description: `Không thể gửi lại email xác thực: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [unconfirmedEmail, toast]);

  const sendVerificationEmail = useCallback(async (params: VerificationParams) => {
    try {
      console.log("Sending verification email for:", params.email, "userId:", params.userId);
      
      // Sử dụng cơ chế retry tối ưu hơn cho việc đồng bộ người dùng
      const syncUser = async () => {
        let attempts = 0;
        const maxAttempts = 2; // Giảm số lần thử
        
        while (attempts < maxAttempts) {
          try {
            attempts++;
            console.log(`Syncing user attempt ${attempts}/${maxAttempts}`);
            
            const { data, error } = await supabase.functions.invoke("sync-user", {
              body: { 
                user_id: params.userId, 
                email: params.email, 
                name: params.name,
                email_verified: false
              }
            });
            
            if (error) {
              console.error("Error syncing user:", error);
              
              // Kiểm tra xem lỗi có thể thử lại không
              if (!isRetryableError(error) && attempts > 1) {
                console.log("Lỗi không thể thử lại, dừng quá trình retry");
                throw error;
              }
              
              if (attempts >= maxAttempts) {
                throw error;
              }
              
              // Tối ưu thời gian chờ với jitter
              const baseDelay = Math.min(300 * Math.pow(1.3, attempts-1), 2000);
              const delay = baseDelay * (0.9 + Math.random() * 0.2);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            return data;
          } catch (err) {
            // Kiểm tra xem lỗi có thể thử lại không
            if (!isRetryableError(err) && attempts > 1) {
              console.log("Lỗi không thể thử lại, dừng quá trình retry");
              throw err;
            }
            
            if (attempts >= maxAttempts) throw err;
            
            // Tối ưu thời gian chờ với jitter
            const baseDelay = Math.min(300 * Math.pow(1.3, attempts-1), 2000);
            const delay = baseDelay * (0.9 + Math.random() * 0.2);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        
        throw new Error("Failed to sync user after multiple attempts");
      };
      
      // Tạo token xác minh
      const token = generateRandomToken(32);
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 giờ
      
      // Xóa các token hiện có song song với việc đồng bộ user
      const [syncResult] = await Promise.all([
        syncUser(),
        db.verification_tokens()
          .delete()
          .eq('user_id', params.userId)
          .eq('type', params.type)
      ]);
      
      console.log("Sync user result:", syncResult);
      
      // Tạo token mới
      const { error: tokenError } = await db.verification_tokens()
        .insert({
          user_id: params.userId,
          token: token,
          type: params.type,
          expires_at: expiresAt.toISOString()
        });

      if (tokenError) {
        throw tokenError;
      }

      // Lấy URL trang web từ cấu hình hệ thống
      const { data: configData, error: configError } = await db.system_configurations()
        .select('value')
        .eq('key', 'site_url')
        .maybeSingle();
      
      // Kiểm tra an toàn cho giá trị cấu hình
      const configValue = configData && typeof configData === 'object' && 'value' in configData ? 
        configData.value : null;
        
      const siteUrl = configValue || window.location.origin;
      console.log("Site URL for verification:", siteUrl);

      // Gọi edge function để gửi email
      const { data, error } = await supabase.functions.invoke("send-verification", {
        body: {
          email: params.email,
          name: params.name,
          verification_type: params.type,
          verification_token: token,
          site_url: siteUrl
        }
      });

      if (error) {
        throw new Error(`Error sending verification email: ${error.message}`);
      }
      
      if (!data?.success) {
        throw new Error(data?.message || "Failed to send verification email");
      }

      toast({
        title: "Xác thực email",
        description: "Chúng tôi đã gửi email xác thực. Vui lòng kiểm tra hộp thư của bạn.",
      });

      return { success: true, data };
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Lỗi",
        description: `Không thể gửi email xác thực: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return { 
    unconfirmedEmail, 
    setUnconfirmedEmail,
    isEmailVerificationRequired, 
    setIsEmailVerificationRequired,
    isLoading,
    setIsLoading,
    fetchEmailVerificationConfig, 
    handleResendVerification,
    sendVerificationEmail 
  };
};

// Hàm tiện ích tạo token ngẫu nhiên
function generateRandomToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const crypto = window.crypto;
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
}
