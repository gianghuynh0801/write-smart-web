
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
      
      // Đợi lâu hơn để đảm bảo trigger đã chạy xong trong database
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      return data.user.id;
    } catch (error) {
      console.error("Lỗi chi tiết khi đăng ký người dùng:", error);
      throw error;
    }
  };

  const syncUser = async (userId: string, email: string, name: string): Promise<UserSyncResponse | null> => {
    try {
      console.log("Đồng bộ dữ liệu cho người dùng:", userId);
      
      // Thêm cơ chế thử lại
      let attempts = 0;
      const maxAttempts = 5; // Tăng số lần thử
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
            // Đợi tăng dần trước khi thử lại
            await new Promise(resolve => setTimeout(resolve, attempts * 1500));
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
            // Đợi tăng dần trước khi thử lại
            await new Promise(resolve => setTimeout(resolve, attempts * 2000));
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
      // Thực hiện kiểm tra với timeout và số lần thử tăng lên
      let retries = 7; // Tăng số lần thử
      let delay = 2000;  // Tăng thời gian delay ban đầu
      
      while (retries > 0) {
        console.log(`Kiểm tra người dùng lần ${8-retries}/7...`);
        
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
        delay *= 1.5;
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
