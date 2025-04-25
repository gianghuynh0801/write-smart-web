
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  email: string;
  name?: string;
  verification_type: "signup" | "password_reset";
  verification_token: string;
  site_url: string;
}

interface SmtpConfig {
  host: string;
  port: string;
  username: string;
  password: string;
  from_email: string;
  from_name: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, verification_type, verification_token, site_url } = await req.json() as VerificationRequest;
    
    console.log(`Processing ${verification_type} verification for ${email}`);

    // Create Supabase client to access the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Fetch SMTP configuration from the database
    const { data: configData, error: configError } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', 'smtp_config')
      .maybeSingle();

    if (configError || !configData?.value) {
      throw new Error("SMTP configuration not found");
    }

    const smtpConfig: SmtpConfig = JSON.parse(configData.value);
    
    console.log("SMTP connection details:", {
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port),
      username: smtpConfig.username,
      from_email: smtpConfig.from_email,
      from_name: smtpConfig.from_name,
      // Don't log password
    });

    // Create SMTP client
    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.host,
        port: parseInt(smtpConfig.port),
        tls: true,
        auth: {
          username: smtpConfig.username,
          password: smtpConfig.password,
        },
      },
      debug: true,
    });

    // Generate appropriate verification URL
    let verificationUrl = "";
    let subject = "";
    let emailTemplate = "";
    
    if (verification_type === "signup") {
      verificationUrl = `${site_url}/#access_token=${verification_token}`;
      subject = "Xác nhận địa chỉ email của bạn";
      emailTemplate = `
        <h2>Xin chào ${name || "bạn"}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác nhận địa chỉ email của bạn bằng cách nhấn vào nút dưới đây:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${verificationUrl}" 
            style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;"
          >
            Xác nhận email
          </a>
        </div>
        <p>Hoặc bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
        <p>Nếu bạn không yêu cầu xác nhận này, vui lòng bỏ qua email.</p>
      `;
    } else if (verification_type === "password_reset") {
      verificationUrl = `${site_url}/reset-password/#access_token=${verification_token}`;
      subject = "Đặt lại mật khẩu của bạn";
      emailTemplate = `
        <h2>Xin chào!</h2>
        <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. Vui lòng nhấn vào nút dưới đây để đặt lại mật khẩu:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${verificationUrl}" 
            style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;"
          >
            Đặt lại mật khẩu
          </a>
        </div>
        <p>Hoặc bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      `;
    }

    // Send email
    await client.send({
      from: `${smtpConfig.from_name || "WriteSmart"} <${smtpConfig.from_email}>`,
      to: email,
      subject: subject,
      html: emailTemplate,
    });

    await client.close();
    console.log(`Email sent successfully to: ${email}`);

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
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 so the frontend can handle the error properly
      }
    );
  }
});
