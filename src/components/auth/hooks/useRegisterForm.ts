
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
    let userId: string | null = null;
    
    try {
      // Kiểm tra email trước khi đăng ký
      console.log("Kiểm tra email:", formData.email);
      const emailExists = await checkEmailExists(formData.email);
      
      if (emailExists) {
        throw new Error("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      }

      // Đăng ký tài khoản mới
      try {
        console.log("Tiến hành đăng ký người dùng mới");
        userId = await registerUser(formData);
        if (!userId) {
          throw new Error("Không thể tạo tài khoản. Vui lòng thử lại sau.");
        }
        console.log("Đã tạo người dùng thành công với ID:", userId);
      } catch (registerError: any) {
        console.error("Lỗi đăng ký người dùng:", registerError);
        if (registerError.message?.includes("23505") || registerError.message?.includes("đã được sử dụng")) {
          throw new Error("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
        }
        throw registerError;
      }
      
      // Thử đồng bộ dữ liệu người dùng
      let syncSuccess = false;
      
      try {
        console.log("Đồng bộ dữ liệu người dùng:", userId);
        await syncUser(userId, formData.email, formData.name);
        syncSuccess = true;
        console.log("Đồng bộ dữ liệu người dùng thành công");
      } catch (syncError: any) {
        console.error("Không thể đồng bộ dữ liệu người dùng:", syncError);
        // Không ném lỗi ở đây, vẫn tiếp tục quy trình ngay cả khi không thể đồng bộ
        toast({
          title: "Cảnh báo",
          description: "Đã tạo tài khoản nhưng gặp vấn đề khi thiết lập dữ liệu. Điều này sẽ không ảnh hưởng đến việc sử dụng tài khoản của bạn.",
          variant: "default"
        });
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
      try {
        await supabase.auth.signOut();
        console.log("Đã đăng xuất người dùng sau khi đăng ký");
      } catch (signOutError) {
        console.error("Lỗi đăng xuất:", signOutError);
        // Bỏ qua lỗi này
      }
      
      // Gửi email xác thực
      try {
        console.log("Gửi email xác thực cho:", formData.email);
        if (userId) {
          await sendVerificationEmail({
            email: formData.email,
            name: formData.name,
            userId: userId,
            type: "email_verification"
          });
          
          console.log("Đã gửi email xác thực thành công");
          setShowVerificationDialog(true);
        } else {
          throw new Error("Không có ID người dùng để gửi email xác thực");
        }
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
      
      // Xử lý lỗi cụ thể
      if (error.message?.includes("duplicate") || 
          error.message?.includes("users_email_key") || 
          error.message?.includes("đã được sử dụng")) {
        setError("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      } else if (error.message?.includes("URL")) {
        setError("Lỗi cấu hình URL xác thực. Vui lòng liên hệ admin.");
      } else {
        setError(error.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
      }

      toast({
        title: "Lỗi đăng ký",
        description: error.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.",
        variant: "destructive"
      });
      
      // Nếu đã tạo user nhưng gặp lỗi trong các bước sau
      if (userId) {
        console.log("Người dùng đã được tạo nhưng gặp lỗi trong quá trình hoàn tất đăng ký.");
        // Có thể thêm logic xử lý ở đây như báo admin hoặc đánh dấu để làm sạch sau
      }
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
