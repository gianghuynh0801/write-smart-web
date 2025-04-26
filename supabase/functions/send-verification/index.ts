
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
  verification_type: "email_verification" | "password_reset";
  verification_token: string;
  site_url: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      email, 
      name, 
      verification_type, 
      verification_token,
      site_url 
    } = await req.json() as VerificationRequest;
    
    if (!email || !verification_type || !verification_token) {
      throw new Error("Missing required parameters");
    }
    
    console.log(`Processing ${verification_type} verification for ${email}`);

    // Create Supabase client to access the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch SMTP configuration from the database
    const { data: configData, error: configError } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', 'smtp_config')
      .maybeSingle();

    if (configError || !configData?.value) {
      throw new Error("SMTP configuration not found or error fetching it");
    }

    const smtpConfig = JSON.parse(configData.value);
    
    console.log("SMTP connection details:", {
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port),
      username: smtpConfig.username,
      from_email: smtpConfig.from_email,
      from_name: smtpConfig.from_name,
    });

    // Create SMTP client with proper configuration
    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.host,
        port: parseInt(smtpConfig.port),
        tls: smtpConfig.port === "465", // Use TLS for port 465
        secure: smtpConfig.port === "465", // Use secure for port 465
        auth: {
          username: smtpConfig.username,
          password: smtpConfig.password,
        },
      },
      debug: true,
    });

    // Generate appropriate verification URL and email template
    let finalVerificationUrl = "";
    let subject = "";
    let emailTemplate = "";
    
    if (verification_type === "email_verification") {
      // Important: Use the email-verified route for our site instead of Supabase's redirect
      finalVerificationUrl = `${site_url}/email-verified#access_token=${verification_token}`;
      subject = "Xác nhận địa chỉ email của bạn";
      emailTemplate = `
        <h2>Xin chào ${name || "bạn"}!</h2>
        <p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác nhận địa chỉ email của bạn bằng cách nhấn vào nút dưới đây:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a 
            href="${finalVerificationUrl}" 
            style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;"
          >
            Xác nhận email
          </a>
        </div>
        <p>Hoặc bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
        <p><a href="${finalVerificationUrl}">${finalVerificationUrl}</a></p>
        <p>Liên kết này sẽ hết hạn sau 72 giờ.</p>
        <p>Nếu bạn không yêu cầu xác nhận này, vui lòng bỏ qua email.</p>
      `;
    }

    // Send email with more detailed logging
    console.log(`Attempting to send email to ${email} with subject "${subject}"`);
    console.log(`Using SMTP server ${smtpConfig.host}:${smtpConfig.port}`);
    
    try {
      await client.send({
        from: `${smtpConfig.from_name || "WriteSmart"} <${smtpConfig.from_email}>`,
        to: email,
        subject: subject,
        html: emailTemplate,
      });
      
      console.log(`Email sent successfully to: ${email}`);
      await client.close();
    } catch (emailError) {
      console.error("SMTP send error:", emailError);
      throw new Error(`SMTP error: ${emailError.message}`);
    }

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
