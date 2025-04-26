
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  name?: string;
  verification_type: "email_verification" | "password_reset";
  verification_token: string;
  site_url: string;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, verification_type, verification_token, site_url } = await req.json() as VerificationRequest;
    
    console.log(`Processing ${verification_type} verification for ${email}`);
    
    // Check if required environment variables are set
    if (!Deno.env.get("SUPABASE_URL") || !Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) {
      console.log("Required environment variables are not set");
      throw new Error("Required environment variables are not set");
    }
    
    console.log("Supabase URL available:", !!Deno.env.get("SUPABASE_URL"));
    console.log("Supabase Service Key available:", !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    
    console.log("Fetching system configurations");
    const { data: configs, error: configError } = await supabase
      .from('system_configurations')
      .select('key, value');

    if (configError) {
      console.error("Error fetching configurations:", configError);
      throw configError;
    }

    console.log("Found configurations:", configs?.map(c => c.key));

    const smtpConfig = configs?.find(c => c.key === 'smtp_config')?.value;
    if (!smtpConfig) {
      throw new Error("SMTP configuration not found");
    }

    console.log("Successfully parsed SMTP config");
    
    const { host, port, username, password, from_email, from_name } = JSON.parse(smtpConfig);
    
    console.log("SMTP connection details:", {
      host,
      port,
      username,
      from_email,
      from_name,
      // Don't log password
    });

    console.log("Creating SMTP client");
    const client = new SMTPClient({
      connection: {
        hostname: host,
        port: parseInt(port),
        tls: true,
        auth: {
          username: username,
          password: password,
        },
      },
    });

    console.log("Generating verification URL and email template");
    const verificationUrl = `${site_url}/email-verified#access_token=${verification_token}`;
    console.log("Verification URL:", verificationUrl);

    const subject = verification_type === "email_verification" 
      ? "Xác nhận địa chỉ email của bạn"
      : "Đặt lại mật khẩu của bạn";

    console.log(`Attempting to send email to ${email} with subject "${subject}"`);
    console.log(`Using SMTP server ${host}:${port}`);

    console.log("Sending email...");
    await client.send({
      from: `${from_name || "Admin"} <${from_email}>`,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Xin chào ${name || "bạn"}!</h2>
          
          ${verification_type === "email_verification" ? `
            <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác nhận địa chỉ email của bạn bằng cách nhấp vào liên kết dưới đây:</p>
          ` : `
            <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>
          `}
          
          <p style="margin: 20px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              ${verification_type === "email_verification" ? "Xác nhận Email" : "Đặt lại Mật khẩu"}
            </a>
          </p>
          
          <p>Hoặc copy liên kết này vào trình duyệt của bạn:</p>
          <p style="background-color: #f8f9fa; padding: 10px; word-break: break-all;">
            ${verificationUrl}
          </p>
          
          <p style="color: #666; font-size: 0.9em;">
            Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này.
          </p>
        </div>
      `,
    });
    
    console.log("Email sent successfully to:", email);
    await client.close();
    console.log("SMTP connection closed");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent successfully to ${email}` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
