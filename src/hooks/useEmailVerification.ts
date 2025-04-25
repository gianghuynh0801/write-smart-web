
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
      // Generate verification token
      const token = generateRandomToken(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      // Store verification token in database
      const { error: tokenError } = await supabase
        .from('verification_tokens')
        .insert({
          user_id: params.userId,
          token: token,
          type: params.type,
          expires_at: expiresAt.toISOString()
        });

      if (tokenError) throw tokenError;

      // Generate verification URL
      const verificationUrl = `${window.location.origin}/verify-email?token=${token}`;

      // Call our custom edge function to send email using SMTP settings
      const response = await supabase.functions.invoke("send-verification", {
        body: {
          email: params.email,
          name: params.name,
          verification_type: params.type,
          verification_token: token,
          verification_url: verificationUrl,
          site_url: window.location.origin
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Error sending verification email");
      }

      toast({
        title: "Xác thực email",
        description: "Chúng tôi đã gửi email xác thực. Vui lòng kiểm tra hộp thư của bạn.",
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Lỗi",
        description: `Không thể gửi email xác thực: ${error instanceof Error ? error.message : "Lỗi không xác định"}`,
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [toast]);

  return { sendVerificationEmail };
};
