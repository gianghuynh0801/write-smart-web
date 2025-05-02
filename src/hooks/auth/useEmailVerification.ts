
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
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
        supabase
          .from('verification_tokens')
          .delete()
          .eq('user_id', params.userId as any)
          .eq('type', params.type as any)
      ]);
      
      console.log("Sync user result:", syncResult);
      
      // Tạo token mới
      const { error: tokenError } = await supabase
        .from('verification_tokens')
        .insert({
          user_id: params.userId,
          token: token,
          type: params.type,
          expires_at: expiresAt.toISOString()
        } as any);

      if (tokenError) {
        throw tokenError;
      }

      // Lấy URL trang web từ cấu hình hệ thống
      const { data: configData, error: configError } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'site_url' as any)
        .maybeSingle();
      
      // Kiểm tra an toàn cho giá trị cấu hình
      const siteUrl = configData && typeof configData === 'object' && 'value' in configData ? 
        configData.value : window.location.origin;
        
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

  return { sendVerificationEmail };
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
