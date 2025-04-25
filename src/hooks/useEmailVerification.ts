
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VerificationParams {
  email: string;
  name?: string;
  token: string;
  type: "signup" | "password_reset";
}

export const useEmailVerification = () => {
  const { toast } = useToast();

  const sendVerificationEmail = useCallback(async (params: VerificationParams) => {
    try {
      // Generate site URL - use the current URL's origin
      const siteUrl = window.location.origin;

      // Call our custom edge function to send email using SMTP settings
      const response = await supabase.functions.invoke("send-verification", {
        body: {
          email: params.email,
          name: params.name,
          verification_type: params.type,
          verification_token: params.token,
          site_url: siteUrl
        }
      });

      if (response.error) {
        throw new Error(response.error.message || "Error sending verification email");
      }

      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error sending verification email:", error);
      toast({
        title: "Lỗi",
        description: `Không thể gửi email xác thực: ${error.message || "Lỗi không xác định"}`,
        variant: "destructive",
      });
      return { success: false, error };
    }
  }, [toast]);

  return { sendVerificationEmail };
};
