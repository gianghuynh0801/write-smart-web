
import { useState, useCallback, useRef } from "react";
import { UserFormValues } from "@/types/user";
import { updateUser, createUser } from "@/api/user/userMutations";
import { authService, isAuthError } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";

interface UseUserDialogSubmitProps {
  userId?: string | number;
  onClose: () => void;
  onUserSaved: () => void;
}

export const useUserDialogSubmit = ({ 
  userId, 
  onClose, 
  onUserSaved 
}: UseUserDialogSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);
  const [saveSuccessful, setSaveSuccessful] = useState(false);
  const { toast } = useToast();

  const handleSubmit = useCallback(async (data: UserFormValues, isClosing: boolean = false) => {
    if (isSubmitting || isClosing) return;
    setIsSubmitting(true);

    try {
      console.log("[UserDialogSubmit] Đang lưu thông tin user:", data);
      
      // Lấy token admin trước khi thực hiện
      await authService.getAdminToken();
      
      let success = false;
      
      if (userId) {
        // Cập nhật người dùng hiện có
        await updateUser(userId, data);
        console.log("[UserDialogSubmit] Đã cập nhật thông tin người dùng thành công");
        success = true;
      } else {
        // Tạo người dùng mới
        await createUser(data);
        console.log("[UserDialogSubmit] Đã tạo người dùng mới thành công");
        success = true;
      }
      
      if (isMounted.current && success) {
        // Đánh dấu đã lưu thành công
        setSaveSuccessful(true);
        
        // Đóng dialog trước khi hiển thị thông báo thành công
        onClose();
        
        // Hiển thị thông báo thành công sau khi đóng dialog
        setTimeout(() => {
          if (isMounted.current) {
            toast({
              title: "Thành công",
              description: userId ? "Cập nhật thông tin người dùng thành công" : "Tạo người dùng mới thành công"
            });
          }
        }, 300);
      }
    } catch (error: any) {
      console.error("[UserDialogSubmit] Lỗi khi lưu thông tin user:", error);
      
      if (!isMounted.current) return;
      
      // Kiểm tra nếu là lỗi xác thực
      if (isAuthError(error)) {
        try {
          console.log("[UserDialogSubmit] Phát hiện lỗi xác thực, đang thử làm mới token...");
          const hasNewToken = await authService.handleAuthError(error);
          
          if (hasNewToken) {
            console.log("[UserDialogSubmit] Đã làm mới token thành công, đang thử lại...");
            
            try {
              let success = false;
              
              if (userId) {
                await updateUser(userId, data);
                console.log("[UserDialogSubmit] Đã cập nhật thông tin người dùng thành công sau khi làm mới token");
                success = true;
              } else {
                await createUser(data);
                console.log("[UserDialogSubmit] Đã tạo người dùng mới thành công sau khi làm mới token");
                success = true;
              }
              
              if (isMounted.current && success) {
                // Đánh dấu đã lưu thành công
                setSaveSuccessful(true);
                onClose();
                
                // Hiển thị thông báo thành công sau khi đóng dialog
                setTimeout(() => {
                  if (isMounted.current) {
                    toast({
                      title: "Thành công",
                      description: userId ? "Cập nhật thông tin người dùng thành công" : "Tạo người dùng mới thành công"
                    });
                  }
                }, 300);
              }
              
              return;
            } catch (retryError: any) {
              if (!isMounted.current) return;
              console.error("[UserDialogSubmit] Lỗi khi thử lại:", retryError);
              throw retryError;
            }
          }
          
          if (isMounted.current) {
            toast({
              title: "Lỗi xác thực",
              description: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại để tiếp tục.",
              variant: "destructive"
            });
          }
        } catch (refreshError) {
          if (!isMounted.current) return;
          console.error("[UserDialogSubmit] Lỗi khi làm mới token:", refreshError);
          toast({
            title: "Lỗi xác thực",
            description: "Không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại.",
            variant: "destructive"
          });
        }
      } else if (isMounted.current) {
        toast({
          title: "Lỗi",
          description: error.message || "Có lỗi xảy ra khi lưu thông tin",
          variant: "destructive"
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  }, [userId, onClose, isSubmitting, toast]);

  return {
    isSubmitting,
    setIsSubmitting,
    handleSubmit,
    isMounted,
    saveSuccessful,
    setSaveSuccessful
  };
};
