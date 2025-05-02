
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Check, AlertTriangle } from "lucide-react";

const EmailVerified = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Đang xác thực email của bạn...");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log("Starting email verification process");
        console.log("URL hash:", location.hash);
        
        // Trích xuất token từ URL hash fragment
        const hashParams = new URLSearchParams(location.hash.substring(1));
        const token = hashParams.get("access_token");
        
        if (!token) {
          console.error("No verification token found in URL");
          throw new Error("Không tìm thấy mã xác thực");
        }

        console.log("Found verification token:", token);

        // Xác minh token trong bảng verification_tokens
        const { data: tokenData, error: tokenError } = await supabase
          .from('verification_tokens')
          .select('*')
          .eq('token', token as any)
          .eq('type', 'email_verification' as any)
          .maybeSingle();

        if (tokenError) {
          console.error("Error fetching token:", tokenError);
          throw new Error("Không thể kiểm tra mã xác thực");
        }

        if (!tokenData) {
          console.error("Token not found in database");
          throw new Error("Mã xác thực không hợp lệ hoặc đã hết hạn");
        }

        console.log("Token verified in database:", tokenData);

        // Kiểm tra hết hạn token
        if (!tokenData || typeof tokenData !== 'object' || !('expires_at' in tokenData)) {
          throw new Error("Dữ liệu token không hợp lệ");
        }
        
        const expiresAt = new Date(tokenData.expires_at as string);
        if (expiresAt < new Date()) {
          console.error("Token expired at:", expiresAt);
          throw new Error("Mã xác thực đã hết hạn");
        }

        // Cập nhật trạng thái email_verified cho người dùng trong bảng users
        if (!tokenData || typeof tokenData !== 'object' || !('user_id' in tokenData)) {
          throw new Error("Không tìm thấy ID người dùng");
        }
        
        console.log("Updating user verification status for user:", tokenData.user_id);
        const { error: updateError } = await supabase
          .from('users')
          .update({ email_verified: true } as any)
          .eq('id', tokenData.user_id as any);

        if (updateError) {
          console.error("Error updating user verification status:", updateError);
          throw updateError;
        }

        // Xóa token đã sử dụng
        if (!tokenData || typeof tokenData !== 'object' || !('id' in tokenData)) {
          console.warn("Không thể xóa token đã sử dụng (không có ID)");
        } else {
          console.log("Deleting used verification token");
          await supabase
            .from('verification_tokens')
            .delete()
            .eq('id', tokenData.id as any);
        }

        console.log("Email verification completed successfully!");
        setStatus("success");
        setMessage("Email của bạn đã được xác thực thành công!");
        
        // Chuyển hướng đến trang đăng nhập sau 3 giây
        setTimeout(() => {
          navigate("/login");
        }, 3000);

      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Đã xảy ra lỗi khi xác thực email.");
      }
    };

    verifyEmail();
  }, [location, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg text-center">
          {status === "loading" && (
            <>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <h1 className="text-2xl font-bold">Đang xác thực</h1>
              <p className="text-gray-600">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <Check className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Xác thực thành công!</h1>
              <p className="text-gray-600">{message}</p>
              <div className="pt-4">
                <Button onClick={() => navigate("/login")}>
                  Đến trang đăng nhập
                </Button>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-4">
                  <AlertTriangle className="h-10 w-10 text-red-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Xác thực thất bại</h1>
              <p className="text-gray-600">{message}</p>
              <div className="pt-4 space-y-3">
                <Button onClick={() => navigate("/login")}>
                  Đến trang đăng nhập
                </Button>
                <div>
                  <Button variant="outline" onClick={() => navigate("/register")}>
                    Đăng ký tài khoản mới
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EmailVerified;
