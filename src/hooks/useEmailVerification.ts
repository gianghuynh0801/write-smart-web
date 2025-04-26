
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
      
      // Generate verification token with longer expiration time
      const token = generateRandomToken(32);
      const expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // Extended to 72 hours for testing
      
      console.log("Creating verification token for user:", params.userId);
      
      // Delete any existing tokens for this user and type
      console.log("Cleaning up existing tokens for user:", params.userId);
      const { error: deleteError } = await supabase
        .from('verification_tokens')
        .delete()
        .eq('user_id', params.userId)
        .eq('type', params.type);

      if (deleteError) {
        console.error("Error deleting existing tokens:", deleteError);
      }
      
      // Create new token
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

      // Get the site URL from system configurations
      console.log("Fetching site URL from system configurations");
      const { data: configData, error: configError } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'site_url')
        .single();
      
      if (configError) {
        console.error("Error fetching site URL:", configError);
      }
      
      // Fallback to a default URL if we can't get from config
      const siteUrl = configData?.value || "https://lxhawtndkubaeljbaylp.supabase.co";
      console.log("Site URL for verification:", siteUrl);

      // Call our custom edge function to send email using SMTP settings
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
