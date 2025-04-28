
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEmailVerification } from "@/hooks/useEmailVerification";

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export const useRegisterUser = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { sendVerificationEmail } = useEmailVerification();

  const registerUser = async (formData: RegisterFormData): Promise<string | null> => {
    console.log("Bắt đầu tạo tài khoản:", formData.email);
    
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: formData.email, 
        password: formData.password,
        options: {
          data: { 
            full_name: formData.name,
            email_verified: false
          },
          emailRedirectTo: `${window.location.origin}/email-verified`
        }
      });
      
      if (error) throw error;
      
      if (!data?.user) {
        throw new Error("Không thể tạo tài khoản. Vui lòng thử lại sau.");
      }

      // Đợi 1 giây để đảm bảo trigger đã chạy xong trong database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return data.user.id;
    } catch (error) {
      console.error("Lỗi khi đăng ký người dùng:", error);
      throw error;
    }
  };

  const syncUser = async (userId: string, email: string, name: string) => {
    try {
      console.log("Đang đồng bộ dữ liệu người dùng:", userId);
      
      // Kiểm tra nếu người dùng đã tồn tại trong bảng public.users
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Lỗi khi kiểm tra người dùng:", checkError);
        throw new Error(`Không thể kiểm tra người dùng: ${checkError.message}`);
      }
      
      if (!existingUser) {
        console.log("Người dùng chưa tồn tại, đang đồng bộ...");
        
        // Gọi edge function sync-user để đồng bộ dữ liệu người dùng
        const { data: syncData, error: syncError } = await supabase.functions.invoke("sync-user", {
          body: { 
            user_id: userId, 
            email: email, 
            name: name,
            email_verified: false
          }
        });
        
        if (syncError) {
          console.error("Lỗi đồng bộ người dùng:", syncError);
          throw new Error(`Không thể đồng bộ người dùng: ${syncError.message}`);
        }
        
        console.log("Kết quả đồng bộ người dùng:", syncData);
        
        // Đợi thêm 2 giây sau khi đồng bộ
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        console.log("Người dùng đã tồn tại trong database:", existingUser);
      }
    } catch (error) {
      console.error("Lỗi trong quá trình đồng bộ:", error);
      throw error;
    }
  };

  const verifyUserCreation = async (userId: string) => {
    try {
      // Thực hiện nhiều lần kiểm tra với timeout
      let retries = 5; // Tăng số lần thử lên 5
      let delay = 1000; // Bắt đầu với 1 giây
      
      while (retries > 0) {
        console.log(`Kiểm tra người dùng lần ${6-retries}/5...`);
        
        const { data: checkUser, error: checkUserError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        
        if (checkUserError) {
          console.error("Lỗi kiểm tra người dùng:", checkUserError);
          throw new Error(`Không thể kiểm tra người dùng: ${checkUserError.message}`);
        }
        
        if (checkUser) {
          console.log("Người dùng đã được tạo thành công trong database:", checkUser);
          return; // Kết thúc thành công
        }
        
        // Đợi trước khi kiểm tra lại, với thời gian chờ tăng dần
        await new Promise(resolve => setTimeout(resolve, delay));
        retries--;
        delay *= 1.5; // Tăng thời gian chờ lên 50% mỗi lần
      }
      
      // Nếu tất cả các lần thử đều thất bại, vẫn tiếp tục quá trình
      console.warn("Không thể xác minh người dùng trong cơ sở dữ liệu sau nhiều lần thử. Tiếp tục quá trình.");
    } catch (error) {
      console.error("Lỗi khi xác minh người dùng:", error);
      // Không ném lỗi ở đây, để quá trình đăng ký tiếp tục
      console.warn("Tiếp tục quá trình mặc dù có lỗi xác minh");
    }
  };

  return {
    registerUser,
    syncUser,
    verifyUserCreation
  };
};
