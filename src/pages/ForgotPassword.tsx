
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { isValidEmail } from "@/utils/validation";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Check } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendVerificationEmail } = useEmailVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      return;
    }

    setIsLoading(true);

    try {
      // Generate a password reset token
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      
      // The resetPasswordForEmail method doesn't return the token
      // We'll use a different approach for custom emails - extract the token from the auth flow
      
      // Send a separate request to get a session for this user (for demonstration)
      // In production, you might want to create a more secure flow
      const { data: authData } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        }
      });
      
      // Use the token (if available) or a placeholder
      // Adding proper null checking for authData.session
      const token = authData?.session ? authData.session.access_token : "reset-token";
      
      // Send custom reset email
      await sendVerificationEmail({
        email: email,
        token: token,
        type: "password_reset"
      });

      setIsSubmitted(true);
    } catch (error: any) {
      console.error("Reset password error:", error);
      setError(error.message || "Đã xảy ra lỗi khi yêu cầu đặt lại mật khẩu.");
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi yêu cầu đặt lại mật khẩu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-lg">
          {!isSubmitted ? (
            <>
              <div className="text-center">
                <h1 className="text-2xl font-bold">Quên mật khẩu?</h1>
                <p className="text-gray-600 mt-2">
                  Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn liên kết để đặt lại mật khẩu.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Địa chỉ email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Nhập địa chỉ email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Đang xử lý..." : "Gửi liên kết đặt lại mật khẩu"}
                </Button>

                <div className="text-center mt-4">
                  <Button
                    variant="link"
                    onClick={() => navigate("/login")}
                    className="text-primary"
                  >
                    Quay lại trang đăng nhập
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-3">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold">Kiểm tra email của bạn</h1>
              <p className="text-gray-600">
                Chúng tôi đã gửi một email chứa liên kết đặt lại mật khẩu đến {email}. 
                Vui lòng kiểm tra hộp thư đến của bạn và nhấp vào liên kết để đặt lại mật khẩu.
              </p>
              <Button onClick={() => navigate("/login")}>
                Quay lại trang đăng nhập
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
