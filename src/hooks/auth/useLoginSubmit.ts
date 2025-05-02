
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/integrations/supabase/typeSafeClient";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

export function useLoginSubmit() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redirectInProgress, setRedirectInProgress] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (
    email: string, 
    password: string, 
    isEmailVerificationRequired: boolean,
    setUnconfirmedEmail: (email: string) => void,
    setRedirect: (value: boolean) => void
  ) => {
    if (isLoading || redirectInProgress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Sử dụng phương thức login từ AuthContext
      await login(email, password);
      
      console.log("Đăng nhập thành công, chuyển hướng đến dashboard");
      setRedirect(true);
      
      // Chuyển hướng đến dashboard sau khi đăng nhập thành công
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
      
    } catch (error: any) {
      console.error("Lỗi đăng nhập:", error);
      
      // Kiểm tra lỗi email chưa xác thực
      if (error.message?.includes('Email not confirmed') || error.message?.includes('email không được xác minh')) {
        console.log("Email chưa được xác thực:", email);
        
        // Chỉ xử lý yêu cầu xác thực email nếu cấu hình yêu cầu
        if (isEmailVerificationRequired) {
          setError("Email chưa được xác thực. Vui lòng xác thực email trước khi đăng nhập.");
          setUnconfirmedEmail(email);
        } else {
          console.log("Bỏ qua lỗi email chưa xác thực vì cấu hình không yêu cầu");
          
          // Đánh dấu email đã được xác thực trong database
          await markEmailAsVerified(email);
          
          // Thử đăng nhập lại
          try {
            await login(email, password);
            
            console.log("Đăng nhập thành công sau khi đánh dấu email đã xác thực");
            setRedirect(true);
            
            setTimeout(() => {
              navigate('/dashboard');
            }, 500);
            
            return;
          } catch (retryError: any) {
            console.error("Vẫn lỗi sau khi đánh dấu email đã xác thực:", retryError);
            setError(retryError.message);
          }
        }
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hàm đánh dấu email đã được xác thực
  const markEmailAsVerified = async (email: string) => {
    try {
      // Lấy thông tin người dùng từ email
      const { data: userData, error: userError } = await db.users()
        .select('id')
        .eq('email', email)
        .maybeSingle();
      
      if (userError || !userData) {
        console.error("Không tìm thấy người dùng với email:", email);
        return false;
      }
      
      // Kiểm tra và truy cập an toàn thuộc tính id
      const userId = userData && typeof userData === 'object' && 'id' in userData ? 
        userData.id : null;
        
      if (!userId) {
        console.error("ID người dùng không hợp lệ");
        return false;
      }
      
      // Cập nhật trạng thái xác thực email
      const { error: updateError } = await db.users()
        .update({ email_verified: true })
        .eq('id', userId);
      
      if (updateError) {
        console.error("Lỗi khi cập nhật trạng thái xác thực email:", updateError);
        return false;
      }
      
      console.log("Đã đánh dấu email đã xác thực:", email);
      return true;
    } catch (error) {
      console.error("Lỗi không xác định khi đánh dấu email đã xác thực:", error);
      return false;
    }
  };

  return {
    isLoading,
    error,
    redirectInProgress,
    setRedirectInProgress,
    handleLogin
  };
}
