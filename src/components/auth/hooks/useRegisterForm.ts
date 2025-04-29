
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
    handleChange,
    setProgress
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
    setProgress(10); // Khởi tạo tiến trình
    let userId: string | null = null;
    
    try {
      // Kiểm tra email trước khi đăng ký
      console.log("Kiểm tra email:", formData.email);
      setProgress(20);
      const emailExists = await checkEmailExists(formData.email);
      
      if (emailExists) {
        throw new Error("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
      }

      setProgress(30);
      // Đăng ký tài khoản mới
      try {
        console.log("Tiến hành đăng ký người dùng mới");
        userId = await registerUser(formData);
        if (!userId) {
          throw new Error("Không thể tạo tài khoản. Vui lòng thử lại sau.");
        }
        console.log("Đã tạo người dùng thành công với ID:", userId);
        setProgress(50);
      } catch (registerError: any) {
        console.error("Lỗi đăng ký người dùng:", registerError);
        
        // Kiểm tra lỗi tạo bảng hoặc tạo gói đăng ký
        if (registerError.message?.includes("subscriptions") || registerError.message?.includes("relation")) {
          // Đây là lỗi database, không hiển thị cho người dùng
          console.error("Lỗi cơ sở dữ liệu khi đăng ký:", registerError);
          throw new Error("Có lỗi xảy ra khi thiết lập tài khoản. Vui lòng thử lại sau.");
        }
        
        if (registerError.message?.includes("23505") || registerError.message?.includes("đã được sử dụng")) {
          throw new Error("Email này đã được sử dụng. Vui lòng chọn email khác hoặc đăng nhập.");
        }
        
        throw registerError;
      }
      
      // Song song hóa: Tạo đồng thời các Promise cho đồng bộ người dùng và kiểm tra
      setProgress(60);
      const syncPromise = syncUser(userId, formData.email, formData.name);
      const verifyPromise = verifyUserCreation(userId);
      
      // Chờ cả hai hoàn thành
      const [syncResult, verifySuccess] = await Promise.all([syncPromise, verifyPromise]);
      
      const syncSuccess = syncResult?.success || false;
      setProgress(75);
      
      if (!syncSuccess && syncResult?.warnings?.length > 0) {
        console.warn("Cảnh báo khi đồng bộ dữ liệu:", syncResult.warnings);
      }
      
      console.log("Kết quả đồng bộ dữ liệu người dùng:", syncResult);
      
      // Đăng xuất người dùng sau khi đăng ký
      try {
        await supabase.auth.signOut();
        console.log("Đã đăng xuất người dùng sau khi đăng ký");
        setProgress(85);
      } catch (signOutError) {
        console.error("Lỗi đăng xuất:", signOutError);
        // Bỏ qua lỗi này
      }
      
      // Gửi email xác thực - chuyển thành background task
      if (userId) {
        // Hiển thị dialog xác thực sớm để cải thiện UX
        setProgress(95);
        setShowVerificationDialog(true);
        
        // Gửi email xác thực trong background
        setTimeout(() => {
          sendVerificationEmail({
            email: formData.email,
            name: formData.name,
            userId: userId!,
            type: "email_verification"
          }).catch((emailError: any) => {
            console.error("Lỗi gửi email xác thực trong background:", emailError);
            toast({
              title: "Cảnh báo",
              description: "Đã tạo tài khoản nhưng không thể gửi email xác thực. Vui lòng liên hệ hỗ trợ.",
              variant: "destructive"
            });
          });
        }, 0);

        setProgress(100);
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
      } else if (error.message?.includes("relation") || error.message?.includes("subscriptions")) {
        // Đây là lỗi database, hiển thị thông điệp thân thiện hơn
        setError("Có lỗi xảy ra khi thiết lập tài khoản. Hệ thống đang bảo trì, vui lòng thử lại sau.");
      } else {
        setError(error.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.");
      }

      toast({
        title: "Lỗi đăng ký",
        description: error.message?.includes("relation") || error.message?.includes("subscriptions")
          ? "Hệ thống đang bảo trì, vui lòng thử lại sau." 
          : (error.message || "Đã có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau."),
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
    closeVerificationDialog,
    progress: useRegisterFormState().progress
  };
};
