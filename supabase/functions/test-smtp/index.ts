
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
  test_email?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const config = body.config as SmtpConfig;
    const testEmail = config.test_email;
    
    console.log("Received SMTP config request with:", {
      host: config.host,
      port: config.port,
      username: config.username,
      from_email: config.from_email,
      from_name: config.from_name,
      test_email: testEmail,
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

    if (!testEmail) {
      throw new Error("Thiếu email để gửi test");
    }

    console.log("Attempting to connect to SMTP server:", { 
      host: config.host, 
      port: config.port,
      username: config.username,
      test_email: testEmail,
      // Don't log password for security
    });
    
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

    // Make sure we use the correct from email
    const fromEmail = config.from_email || config.username;
    
    await client.send({
      from: `${config.from_name || "Test"} <${fromEmail}>`,
      to: testEmail,
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
    console.log("Email sent successfully to:", testEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Đã gửi email test thành công đến ${testEmail}` 
      }),
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
        success: false,
        message: errorMessage,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 so the frontend can handle the error properly
      }
    );
  }
});
