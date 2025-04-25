
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { Check, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const EmailVerified = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Đang xác thực email của bạn...");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Check if there's an access token in the URL - this means email was verified
        if (location.hash && location.hash.includes("access_token")) {
          // Extract the token from the URL hash
          const hashParams = new URLSearchParams(location.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          
          if (accessToken) {
            // Email has been verified successfully
            setStatus("success");
            setMessage("Email của bạn đã được xác thực thành công!");
            
            // Try to exchange the token for a session
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get("refresh_token") || "",
            });
            
            if (data && data.session) {
              // User is logged in
              setMessage("Email của bạn đã được xác thực thành công! Bạn sẽ được chuyển hướng đến trang chủ.");
              setTimeout(() => {
                navigate("/dashboard");
              }, 3000);
            }
          } else {
            throw new Error("Access token not found in URL");
          }
        } else {
          // No access token found
          setStatus("error");
          setMessage("Không thể xác thực email. Liên kết không hợp lệ hoặc đã hết hạn.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Đã xảy ra lỗi khi xác thực email.");
        console.error("Email verification error:", error);
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
