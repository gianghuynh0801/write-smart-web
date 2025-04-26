
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
      
      // Đầu tiên đảm bảo người dùng tồn tại trong bảng users bằng cách sử dụng hàm sync-user
      console.log("Syncing user to ensure existence in database");
      const { data: syncData, error: syncError } = await supabase.functions.invoke("sync-user", {
        body: { 
          user_id: params.userId, 
          email: params.email, 
          name: params.name,
          email_verified: false
        }
      });
      
      if (syncError) {
        console.error("Error syncing user:", syncError);
        throw new Error(`Failed to sync user: ${syncError.message}`);
      }
      
      console.log("User sync response:", syncData);
      
      // Tạo token xác minh với thời gian hết hạn dài hơn
      const token = generateRandomToken(32);
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // Kéo dài tới 72 giờ để test
      
      console.log("Creating verification token for user:", params.userId);
      
      // Xóa các token hiện có cho người dùng này và loại này
      console.log("Cleaning up existing tokens for user:", params.userId);
      const { error: deleteError } = await supabase
        .from('verification_tokens')
        .delete()
        .eq('user_id', params.userId)
        .eq('type', params.type);

      if (deleteError) {
        console.error("Error deleting existing tokens:", deleteError);
      }
      
      // Tạo token mới
      console.log("Creating new verification token");
      const { error: tokenError } = await supabase
        .from('verification_tokens')
        .insert({
          user_id: params.userId,
          token: token,
          type: params.type,
          expires_at: expiresAt.toISOString()
        });

      if (tokenError) {
        console.error("Error creating verification token:", tokenError);
        throw tokenError;
      }

      console.log("Verification token created successfully");

      // Lấy URL trang web từ cấu hình hệ thống
      console.log("Fetching site URL from system configurations");
      const { data: configData, error: configError } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'site_url')
        .single();
      
      if (configError) {
        console.error("Error fetching site URL:", configError);
      }
      
      // Sử dụng origin làm URL trang web mặc định nếu không được cấu hình trong cơ sở dữ liệu
      const siteUrl = configData?.value || window.location.origin;
      console.log("Site URL for verification:", siteUrl);

      // Gọi edge function tùy chỉnh để gửi email sử dụng cài đặt SMTP
      console.log("Invoking send-verification function with params:", {
        email: params.email,
        name: params.name,
        verification_type: params.type,
        verification_token: token,
        site_url: siteUrl
      });
      
      const { data, error } = await supabase.functions.invoke("send-verification", {
        body: {
          email: params.email,
          name: params.name,
          verification_type: params.type,
          verification_token: token,
          site_url: siteUrl
        }
      });

      console.log("Edge function response:", data, error);
      
      if (error) {
        console.error("Error from edge function:", error);
        throw new Error(`Error sending verification email: ${error.message}`);
      }
      
      if (!data?.success) {
        console.error("Edge function reported failure:", data?.message);
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
