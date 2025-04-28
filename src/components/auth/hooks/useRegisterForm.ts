
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
      // Kiểm tra email trước khi đăng ký
      console.log("Kiểm tra email:", formData.email);
      const emailExists = await checkEmailExists(formData.email);
      
      if (emailExists) {
        throw new Error("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      }

      // Đăng ký tài khoản mới
      console.log("Tiến hành đăng ký người dùng mới");
      const userId = await registerUser(formData);
      if (!userId) {
        throw new Error("Không thể tạo tài khoản. Vui lòng thử lại sau.");
      }
      
      // Thử đồng bộ dữ liệu người dùng
      console.log("Đồng bộ dữ liệu người dùng:", userId);
      let syncSuccess = false;
      
      try {
        await syncUser(userId, formData.email, formData.name);
        syncSuccess = true;
      } catch (syncError) {
        console.error("Không thể đồng bộ dữ liệu người dùng:", syncError);
        // Vẫn tiếp tục quy trình ngay cả khi không thể đồng bộ
      }
      
      if (syncSuccess) {
        // Xác minh người dùng đã được tạo thành công
        try {
          console.log("Xác minh người dùng đã được tạo thành công");
          await verifyUserCreation(userId);
        } catch (verifyError) {
          console.error("Lỗi xác minh:", verifyError);
          // Vẫn tiếp tục quy trình
        }
      }
      
      // Đăng xuất người dùng sau khi đăng ký
      await supabase.auth.signOut();
      console.log("Đã đăng xuất người dùng sau khi đăng ký");
      
      // Gửi email xác thực
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
      console.error("Lỗi đăng ký:", error);
      
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
