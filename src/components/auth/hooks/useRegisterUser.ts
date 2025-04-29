
import { supabase } from "@/integrations/supabase/client";
import { UserSyncResponse } from "@/api/subscription/types";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export const useRegisterUser = () => {
  const registerUser = async (formData: RegisterFormData): Promise<string | null> => {
    console.log("Bắt đầu tạo tài khoản:", formData.email);
    
    try {
      // Sử dụng URL cố định cho redirect
      const redirectUrl = 'https://preview--write-smart-web.lovable.app/email-verified';
      console.log("Redirect URL được cấu hình:", redirectUrl);
      
      const { data, error } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          data: { 
            full_name: formData.name,
            email_verified: false
          },
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error("Lỗi đăng ký:", error);
        if (error.message.includes('URL')) {
          throw new Error("Lỗi cấu hình URL xác thực. Vui lòng thử lại sau.");
        }
        throw error;
      }
      
      if (!data?.user) {
        console.error("Không có dữ liệu user được trả về");
        throw new Error("Không thể tạo tài khoản. Vui lòng thử lại sau.");
      }

      console.log("Đăng ký thành công, ID người dùng:", data.user.id);
      
      // Giảm thời gian chờ xuống còn 1000ms (từ 3000ms)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return data.user.id;
    } catch (error) {
      console.error("Lỗi chi tiết khi đăng ký người dùng:", error);
      throw error;
    }
  };

  const syncUser = async (userId: string, email: string, name: string): Promise<UserSyncResponse | null> => {
    try {
      console.log("Đồng bộ dữ liệu cho người dùng:", userId);
      
      // Cải thiện cơ chế thử lại
      let attempts = 0;
      const maxAttempts = 4; // Giảm từ 5 xuống 4
      let lastError: any = null;
      let result: UserSyncResponse | null = null;
      
      while (attempts < maxAttempts) {
        try {
          attempts++;
          console.log(`Nỗ lực đồng bộ lần ${attempts}/${maxAttempts}`);
          
          const { data, error } = await supabase.functions.invoke("sync-user", {
            body: { 
              user_id: userId, 
              email: email, 
              name: name,
              email_verified: false
            }
          });
          
          if (error) {
            console.error(`Lỗi đồng bộ người dùng (lần thử ${attempts}):`, error);
            lastError = error;
            // Tối ưu công thức tính thời gian chờ
            const delay = Math.min(500 * Math.pow(1.5, attempts-1), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          
          console.log("Kết quả đồng bộ người dùng:", data);
          result = data as UserSyncResponse;
          
          // Đồng bộ thành công, thoát vòng lặp
          return result;
        } catch (attemptError) {
          console.error(`Lỗi đồng bộ lần ${attempts}:`, attemptError);
          lastError = attemptError;
          
          if (attempts < maxAttempts) {
            // Tối ưu công thức tính thời gian chờ
            const delay = Math.min(500 * Math.pow(1.5, attempts-1), 5000);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            return {
              success: false,
              message: `Không thể đồng bộ dữ liệu người dùng: ${lastError?.message || 'Lỗi không xác định'}`,
              warnings: [`Lỗi sau ${maxAttempts} lần thử: ${lastError?.message || 'Lỗi không xác định'}`]
            };
          }
        }
      }
      
      // Nếu đã thử hết số lần mà vẫn không thành công
      return {
        success: false,
        message: `Không thể đồng bộ dữ liệu người dùng sau ${maxAttempts} lần thử`,
        warnings: [`Lỗi sau ${maxAttempts} lần thử: ${lastError?.message || 'Lỗi không xác định'}`]
      };
    } catch (error: any) {
      console.error("Lỗi trong quá trình đồng bộ:", error);
      return {
        success: false,
        message: `Lỗi đồng bộ: ${error?.message || 'Lỗi không xác định'}`,
        warnings: [`Lỗi đồng bộ: ${error?.message || 'Lỗi không xác định'}`]
      };
    }
  };

  const verifyUserCreation = async (userId: string) => {
    try {
      // Tối ưu: giảm số lần thử và thời gian chờ
      let retries = 5; // Giảm từ 7 xuống 5
      let delay = 1000;  // Giảm từ 2000ms xuống 1000ms
      
      while (retries > 0) {
        console.log(`Kiểm tra người dùng lần ${6-retries}/5...`);
        
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (error) {
          console.error("Lỗi kiểm tra người dùng:", error);
          throw error;
        }
        
        if (user) {
          console.log("Người dùng đã được tạo thành công:", user);
          return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        retries--;
        delay = Math.min(delay * 1.3, 3000); // Tăng delay với giới hạn tối đa 3000ms
      }
      
      console.warn("Không thể xác minh người dùng trong database sau nhiều lần thử. Tiếp tục quá trình.");
      return false;
    } catch (error) {
      console.error("Lỗi khi xác minh người dùng:", error);
      // Không ném lỗi ở đây để quá trình đăng ký tiếp tục
      console.warn("Tiếp tục quá trình mặc dù có lỗi xác minh");
      return false;
    }
  };

  return {
    registerUser,
    syncUser,
    verifyUserCreation
  };
};
