
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { useRegisterFormState } from "./useRegisterFormState";
import { useEmailCheck } from "./useEmailCheck";
import { useRegisterValidation } from "./useRegisterValidation";
import { useRegisterUser } from "./useRegisterUser";

export const useRegisterForm = () => {
  const {
    formData,
    isLoading,
    error,
    showVerificationDialog,
    setIsLoading,
    setError,
    setShowVerificationDialog,
    handleChange
  } = useRegisterFormState();

  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkEmailExists } = useEmailCheck();
  const { validateForm } = useRegisterValidation();
  const { registerUser, syncUser, verifyUserCreation } = useRegisterUser();
  const { sendVerificationEmail } = useEmailVerification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm(formData)) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        throw new Error("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      }

      const userId = await registerUser(formData);
      if (!userId) return;
      
      await syncUser(userId, formData.email, formData.name);
      await verifyUserCreation(userId);
      
      await supabase.auth.signOut();
      console.log("Đã đăng xuất người dùng sau khi đăng ký");
      
      try {
        console.log("Gửi email xác thực cho:", formData.email);
        await sendVerificationEmail({
          email: formData.email,
          name: formData.name,
          userId: userId,
          type: "email_verification"
        });
        
        console.log("Đã gửi email xác thực thành công");
        setShowVerificationDialog(true);
      } catch (emailError: any) {
        console.error("Lỗi gửi email xác thực:", emailError);
        toast({
          title: "Cảnh báo",
          description: "Đã tạo tài khoản nhưng không thể gửi email xác thực. Vui lòng liên hệ hỗ trợ.",
          variant: "destructive"
        });
        navigate("/verify-email-prompt");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      
      if (error.code === "23505" || error.message?.includes("users_email_key")) {
        setError("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      } else {
        setError(error.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
      }

      toast({
        title: "Lỗi đăng ký",
        description: error.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeVerificationDialog = () => {
    setShowVerificationDialog(false);
    navigate("/verify-email-prompt");
  };

  return {
    formData,
    isLoading,
    error,
    showVerificationDialog,
    handleChange,
    handleSubmit,
    closeVerificationDialog
  };
};
