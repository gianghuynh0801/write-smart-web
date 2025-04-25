
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const body = await req.json();
    const config = body.config as SmtpConfig;
    
    console.log("Received SMTP config request with:", {
      host: config.host,
      port: config.port,
      username: config.username,
      from_email: config.from_email,
      from_name: config.from_name,
      // Don't log password
    });

    // Validate required fields
    const requiredFields = ['host', 'port', 'username', 'password', 'from_email'];
    
    const missingFields = requiredFields.filter(field => {
      const value = config[field as keyof SmtpConfig];
      return !value || value.trim() === '';
    });

    if (missingFields.length > 0) {
      throw new Error(`Thiếu trường ${missingFields.join(', ')}`);
    }

    console.log("Attempting to connect to SMTP server:", { 
      host: config.host, 
      port: config.port,
      username: config.username,
      // Don't log password for security
    });

    // Make sure we use the same email in the "from" field as the username
    // This is important because many SMTP servers require the From email to match
    // the authenticated user's email address
    const fromEmail = config.from_email || config.username;
    
    const client = new SMTPClient({
      connection: {
        hostname: config.host,
        port: parseInt(config.port),
        tls: true,
        auth: {
          username: config.username,
          password: config.password,
        },
      },
      debug: true,  // Enable debug logging
    });

    await client.send({
      from: `${config.from_name || "Test"} <${fromEmail}>`,
      to: config.username, // Send the test email to the authenticated user
      subject: "SMTP Test Email",
      content: "Đây là email test từ hệ thống. Nếu bạn nhận được email này, cấu hình SMTP đã hoạt động.",
      html: `
        <h2>Email Test SMTP</h2>
        <p>Đây là email test từ hệ thống.</p>
        <p>Nếu bạn nhận được email này, cấu hình SMTP đã hoạt động.</p>
        <p>Thông tin cấu hình:</p>
        <ul>
          <li>Host: ${config.host}</li>
          <li>Port: ${config.port}</li>
          <li>Username: ${config.username}</li>
          <li>From Email: ${fromEmail}</li>
          <li>From Name: ${config.from_name || "Test"}</li>
        </ul>
      `
    });

    await client.close();
    console.log("Email sent successfully");

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending test email:", error);
    
    // Send back a more detailed error message
    let errorMessage = error.message;
    
    // Check for common SMTP errors and provide more helpful messages
    if (errorMessage.includes("550")) {
      errorMessage = "Email bị từ chối: Địa chỉ email người gửi không được chấp nhận bởi máy chủ SMTP. Hãy đảm bảo địa chỉ từ (from_email) khớp với tài khoản đã xác thực.";
    } else if (errorMessage.includes("535")) {
      errorMessage = "Xác thực không thành công: Tên người dùng hoặc mật khẩu không chính xác.";
    } else if (errorMessage.includes("connection refused") || errorMessage.includes("ECONNREFUSED")) {
      errorMessage = "Không thể kết nối đến máy chủ SMTP. Vui lòng kiểm tra host và port.";
    } else if (errorMessage.includes("timeout")) {
      errorMessage = "Kết nối đến máy chủ SMTP bị timeout. Vui lòng kiểm tra host và port.";
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
