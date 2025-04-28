import { supabase } from "@/integrations/supabase/client";

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
      
      // Đợi 1 giây để đảm bảo trigger đã chạy xong trong database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return data.user.id;
    } catch (error) {
      console.error("Lỗi chi tiết khi đăng ký người dùng:", error);
      throw error;
    }
  };

  const syncUser = async (userId: string, email: string, name: string) => {
    try {
      console.log("Đồng bộ dữ liệu cho người dùng:", userId);
      
      const { data, error } = await supabase.functions.invoke("sync-user", {
        body: { 
          user_id: userId, 
          email: email, 
          name: name,
          email_verified: false
        }
      });
      
      if (error) {
        console.error("Lỗi đồng bộ người dùng:", error);
        throw error;
      }
      
      console.log("Kết quả đồng bộ người dùng:", data);
      
      // Đợi thêm 1 giây sau khi đồng bộ
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return data;
    } catch (error) {
      console.error("Lỗi trong quá trình đồng bộ:", error);
      throw error;
    }
  };

  const verifyUserCreation = async (userId: string) => {
    try {
      // Thực hiện kiểm tra với timeout
      let retries = 3;
      let delay = 1000;
      
      while (retries > 0) {
        console.log(`Kiểm tra người dùng lần ${4-retries}/3...`);
        
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
          return;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
        retries--;
        delay *= 1.5;
      }
      
      console.warn("Không thể xác minh người dùng trong database sau nhiều lần thử. Tiếp tục quá trình.");
    } catch (error) {
      console.error("Lỗi khi xác minh người dùng:", error);
      // Không ném lỗi ở đây để quá trình đăng ký tiếp tục
      console.warn("Tiếp tục quá trình mặc dù có lỗi xác minh");
    }
  };

  return {
    registerUser,
    syncUser,
    verifyUserCreation
  };
};
