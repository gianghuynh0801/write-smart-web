
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
    // Log request information
    console.log("Received request:", req.method, req.url);
    
    const { 
      email, 
      name, 
      verification_type, 
      verification_token,
      site_url 
    } = await req.json() as VerificationRequest;
    
    console.log("Request payload:", { 
      email, 
      name, 
      verification_type, 
      verification_token: verification_token ? "**token-exists**" : "**missing**", 
      site_url 
    });
    
    if (!email || !verification_type || !verification_token) {
      throw new Error("Missing required parameters");
    }
    
    console.log(`Processing ${verification_type} verification for ${email}`);

    // Create Supabase client to access the database
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    console.log("Supabase URL available:", !!supabaseUrl);
    console.log("Supabase Service Key available:", !!supabaseServiceKey);
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch SMTP and site configurations
    console.log("Fetching system configurations");
    const { data: configData, error: configError } = await supabase
      .from('system_configurations')
      .select('key, value')
      .in('key', ['smtp_config', 'site_url', 'site_name'])
      .order('key');

    if (configError) {
      console.error("Error fetching configurations:", configError);
      throw new Error("System configuration not found or error fetching it");
    }
    
    if (!configData?.length) {
      console.error("No configurations found");
      throw new Error("System configurations not found");
    }
    
    console.log("Found configurations:", configData.map(c => c.key));

    // Convert config array to object for easier access
    const config = configData.reduce((acc: any, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {});

    // Parse SMTP config
    let smtpConfig;
    try {
      smtpConfig = JSON.parse(config.smtp_config || '{}');
      console.log("Successfully parsed SMTP config");
    } catch (error) {
      console.error("Error parsing SMTP config:", error);
      throw new Error("Invalid SMTP configuration format");
    }
    
    // Get site information
    const siteUrl = config.site_url || site_url; // Fallback to provided URL if not configured
    const siteName = config.site_name || "WriteSmart"; // Fallback name
    
    console.log("SMTP connection details:", {
      host: smtpConfig.host,
      port: parseInt(smtpConfig.port),
      username: smtpConfig.username,
      from_email: smtpConfig.from_email,
      from_name: smtpConfig.from_name,
    });
    
    if (!smtpConfig.host || !smtpConfig.port || !smtpConfig.username || !smtpConfig.password || !smtpConfig.from_email) {
      console.error("Incomplete SMTP configuration");
      throw new Error("SMTP configuration is incomplete");
    }

    // Create SMTP client with proper configuration
    console.log("Creating SMTP client");
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
    console.log("Generating verification URL and email template");
    let finalVerificationUrl = "";
    let subject = "";
    let emailTemplate = "";
    
    if (verification_type === "email_verification") {
      // Important: Use the email-verified route for our site instead of Supabase's redirect
      finalVerificationUrl = `${siteUrl}/email-verified#access_token=${verification_token}`;
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
    
    console.log("Verification URL:", finalVerificationUrl);

    // Send email with more detailed logging
    console.log(`Attempting to send email to ${email} with subject "${subject}"`);
    console.log(`Using SMTP server ${smtpConfig.host}:${smtpConfig.port}`);
    
    try {
      console.log("Sending email...");
      await client.send({
        from: `${smtpConfig.from_name || siteName} <${smtpConfig.from_email}>`,
        to: email,
        subject: subject,
        html: emailTemplate,
      });
      
      console.log(`Email sent successfully to: ${email}`);
      await client.close();
      console.log("SMTP connection closed");
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
