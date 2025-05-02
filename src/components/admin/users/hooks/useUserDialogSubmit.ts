
import { useState, useCallback } from "react";
import { UserFormValues } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { updateUser } from "@/api/user/mutations/updateUser";
import { createUser } from "@/api/user/mutations";

interface UseUserDialogSubmitProps {
  userId?: string | number;
  onClose: () => void;
  onUserSaved: () => void;
}

export const useUserDialogSubmit = ({ userId, onClose, onUserSaved }: UseUserDialogSubmitProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessful, setSaveSuccessful] = useState(false);
  const { toast } = useToast();

  const handleSubmit = useCallback(async (data: UserFormValues, isClosing: boolean) => {
    if (isSubmitting || isClosing) return;
    
    setIsSubmitting(true);
    
    try {
      if (userId) {
        // Cập nhật người dùng hiện có
        await updateUser(userId, data);
        
        toast({
          title: "Thành công",
          description: "Cập nhật người dùng thành công",
        });
      } else {
        // Tạo người dùng mới
        await createUser(data);
        
        toast({
          title: "Thành công",
          description: "Tạo người dùng mới thành công",
        });
      }

      // Đánh dấu đã lưu thành công
      setSaveSuccessful(true);
      
      // Đóng dialog
      onClose();

      // Đợi một chút trước khi làm mới dữ liệu
      setTimeout(() => {
        onUserSaved();
        
        // Thêm đoạn mã để tải lại trang sau khi cập nhật thành công
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }, 500);
    } catch (error) {
      console.error("Lỗi khi lưu người dùng:", error);
      
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể lưu thông tin người dùng",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, onClose, onUserSaved, isSubmitting, toast]);

  return {
    isSubmitting,
    setIsSubmitting,
    handleSubmit,
    saveSuccessful,
    setSaveSuccessful
  };
};
