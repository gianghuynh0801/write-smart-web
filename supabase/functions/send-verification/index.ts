
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";
import nodemailer from "npm:nodemailer@6.9.9";

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

// Function to validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") || "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
);

serve(async (req) => {
  // Xử lý CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate và parse input
    const input = await req.json() as VerificationRequest;
    
    // Kiểm tra các trường bắt buộc
    if (!input.email || !input.verification_type || !input.verification_token || !input.site_url) {
      throw new Error("Thiếu thông tin bắt buộc");
    }

    if (!isValidEmail(input.email)) {
      throw new Error("Email không hợp lệ");
    }

    const { email, name, verification_type, verification_token, site_url } = input;

    console.log(`Bắt đầu gửi email ${verification_type} cho ${email}`);

    // Lấy cấu hình SMTP từ database
    const { data: smtpConfig, error: configError } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', 'smtp_config')
      .maybeSingle();

    if (configError || !smtpConfig?.value) {
      console.error("Lỗi khi lấy cấu hình SMTP:", configError);
      throw new Error("Không tìm thấy cấu hình SMTP");
    }

    const { host, port, username, password, from_email, from_name } = JSON.parse(smtpConfig.value);

    console.log(`Kết nối tới SMTP server: ${host}:${port}`);

    // Tạo verification URL
    const verificationUrl = verification_type === "email_verification" 
      ? `${site_url}/email-verified#access_token=${verification_token}`
      : `${site_url}/reset-password#token=${verification_token}`;

    // Tạo subject và content cho email
    const subject = verification_type === "email_verification" 
      ? "Xác nhận địa chỉ email của bạn"
      : "Đặt lại mật khẩu của bạn";

    // Tạo HTML template cho email
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Xin chào ${name || "bạn"}!</h2>
        
        ${verification_type === "email_verification" 
          ? `<p>Cảm ơn bạn đã đăng ký tài khoản. Vui lòng xác nhận địa chỉ email của bạn bằng cách nhấp vào liên kết dưới đây:</p>`
          : `<p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn. Vui lòng nhấp vào liên kết dưới đây để đặt lại mật khẩu:</p>`
        }
        
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
        
        <p style="color: #666; font-size: 0.9em; margin-top: 20px;">
          Nếu bạn không yêu cầu thao tác này, vui lòng bỏ qua email này.<br>
          Liên kết này sẽ hết hạn sau 72 giờ.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #666; font-size: 0.8em;">
          Email này được gửi tự động, vui lòng không trả lời.
        </p>
      </div>
    `;

    console.log("Đang gửi email...");

    try {
      // Khởi tạo nodemailer transport
      const transporter = nodemailer.createTransport({
        host: host,
        port: parseInt(port),
        secure: parseInt(port) === 465, // true for 465, false for other ports
        auth: {
          user: username,
          pass: password,
        },
        tls: {
          // Chấp nhận các self-signed certificates
          rejectUnauthorized: false
        }
      });

      // Gửi email
      const info = await transporter.sendMail({
        from: `${from_name || "Admin"} <${from_email}>`,
        to: email,
        subject: subject,
        html: htmlContent,
      });

      console.log("Email đã được gửi thành công tới:", email, "messageId:", info.messageId);
    } catch (emailError) {
      console.error("Lỗi khi gửi email:", emailError);
      throw new Error(`Không thể gửi email: ${emailError instanceof Error ? emailError.message : "Lỗi không xác định"}`);
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email đã được gửi thành công tới ${email}` 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Lỗi khi gửi email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
