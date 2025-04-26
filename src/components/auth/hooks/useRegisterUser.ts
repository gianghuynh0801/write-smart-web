
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

    return data.user.id;
  };

  const syncUser = async (userId: string, email: string, name: string) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
  };

  const verifyUserCreation = async (userId: string) => {
    const { data: checkUser, error: checkUserError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (checkUserError) {
      console.error("Lỗi kiểm tra người dùng:", checkUserError);
      throw new Error(`Không thể kiểm tra người dùng: ${checkUserError.message}`);
    }
    
    if (!checkUser) {
      console.error("Người dùng không tồn tại sau khi đồng bộ");
      throw new Error("Không thể tạo người dùng trong cơ sở dữ liệu. Vui lòng liên hệ hỗ trợ.");
    }
    
    console.log("Người dùng đã được tạo thành công trong database:", checkUser);
  };

  return {
    registerUser,
    syncUser,
    verifyUserCreation
  };
};
