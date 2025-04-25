
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
      
      // First ensure the user exists in our users table by using the sync-user function
      console.log("Syncing user to ensure existence in database");
      const { data: syncData, error: syncError } = await supabase.functions.invoke("sync-user", {
        body: { 
          user_id: params.userId, 
          email: params.email, 
          name: params.name 
        }
      });
      
      if (syncError) {
        console.error("Error syncing user:", syncError);
        throw new Error(`Failed to sync user: ${syncError.message}`);
      }
      
      console.log("User sync response:", syncData);
      
      // Generate verification token
      const token = generateRandomToken(32);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      console.log("Creating verification token for user:", params.userId);
      
      // Store verification token in database
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

      // Generate verification URL
      const verificationUrl = `${window.location.origin}/verify-email?token=${token}`;
      console.log("Verification URL generated:", verificationUrl);

      // Call our custom edge function to send email using SMTP settings
      console.log("Invoking send-verification function");
      const { data, error } = await supabase.functions.invoke("send-verification", {
        body: {
          email: params.email,
          name: params.name,
          verification_type: params.type,
          verification_token: token,
          verification_url: verificationUrl,
          site_url: window.location.origin
        }
      });

      console.log("Edge function response:", data, error);
      
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
      throw error; // Re-throw to handle in the calling function
    }
  }, [toast]);

  return { sendVerificationEmail };
};
