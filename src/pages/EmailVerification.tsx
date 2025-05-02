
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Check, AlertTriangle } from "lucide-react";

const EmailVerification = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Đang xác thực email của bạn...");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Extract token from URL
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get("token");
        
        if (!token) {
          throw new Error("Không tìm thấy mã xác thực");
        }

        // Verify token
        const { data, error } = await supabase
          .from('verification_tokens' as any)
          .select('*')
          .eq('token', token as any)
          .eq('type', 'email_verification' as any)
          .single();

        if (error || !data) {
          throw new Error("Mã xác thực không hợp lệ hoặc đã hết hạn");
        }

        // Check token expiration
        const dataAny = data as any;
        if (!dataAny || typeof dataAny !== 'object' || !('expires_at' in dataAny)) {
          throw new Error("Dữ liệu token không hợp lệ");
        }
        
        const expiresAt = new Date(dataAny.expires_at as string);
        if (expiresAt < new Date()) {
          throw new Error("Mã xác thực đã hết hạn");
        }

        // Update user's email_verified status
        if (!dataAny || typeof dataAny !== 'object' || !('user_id' in dataAny)) {
          throw new Error("Không tìm thấy ID người dùng");
        }
        
        const { error: updateError } = await supabase
          .from('users' as any)
          .update({ email_verified: true } as any)
          .eq('id', dataAny.user_id as any);

        if (updateError) {
          throw updateError;
        }

        // Delete the used token
        if (!dataAny || typeof dataAny !== 'object' || !('id' in dataAny)) {
          console.warn("Không thể xóa token đã sử dụng (không có ID)");
        } else {
          await supabase
            .from('verification_tokens' as any)
            .delete()
            .eq('id', dataAny.id as any);
        }

        setStatus("success");
        setMessage("Email của bạn đã được xác thực thành công!");
        
        // Redirect to login after 3 seconds
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

export default EmailVerification;
