
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateRandomToken } from "@/utils/tokenUtils";

export interface VerificationParams {
  email: string;
  name?: string;
  userId: string;
  type: "email_verification" | "password_reset";
}

export const useEmailVerification = () => {
  const { toast } = useToast();

  const sendVerificationEmail = useCallback(async (params: VerificationParams) => {
    try {
      console.log("Sending verification email for:", params.email, "userId:", params.userId);
      
      // Sử dụng cơ chế retry tối ưu hơn cho việc đồng bộ người dùng
      const syncUser = async () => {
        let attempts = 0;
        const maxAttempts = 3; // Giảm số lần thử
        
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
              if (attempts >= maxAttempts) {
                throw error;
              }
              
              // Tối ưu thời gian chờ
              const delay = Math.min(500 * Math.pow(1.5, attempts-1), 3000);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            
            return data;
          } catch (err) {
            if (attempts >= maxAttempts) throw err;
            const delay = Math.min(500 * Math.pow(1.5, attempts-1), 3000);
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
          .eq('user_id', params.userId)
          .eq('type', params.type)
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
        });

      if (tokenError) {
        throw tokenError;
      }

      // Lấy URL trang web từ cấu hình hệ thống
      const { data: configData, error: configError } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'site_url')
        .single();
      
      // Sử dụng origin làm URL trang web mặc định nếu không được cấu hình trong cơ sở dữ liệu
      const siteUrl = configData?.value || window.location.origin;
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
