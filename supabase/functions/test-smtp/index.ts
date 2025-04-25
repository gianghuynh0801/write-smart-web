
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
    const { config } = await req.json() as { config: SmtpConfig };
    
    // Validate required fields
    const requiredFields = ['host', 'port', 'username', 'password', 'from_email'];
    for (const field of requiredFields) {
      if (!config[field as keyof SmtpConfig]) {
        throw new Error(`Thiếu trường ${field}`);
      }
    }

    console.log("Attempting to connect to SMTP server:", { 
      host: config.host, 
      port: config.port,
      username: config.username,
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

    await client.send({
      from: `${config.from_name || "Test"} <${config.from_email}>`,
      to: config.username,
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
          <li>From Email: ${config.from_email}</li>
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
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
