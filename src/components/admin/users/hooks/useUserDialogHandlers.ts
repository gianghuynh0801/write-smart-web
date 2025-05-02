
import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { clearAllUserCache } from "@/utils/api/userApiUtils";

interface UseUserDialogHandlersProps {
  confirmDeleteUser: () => Promise<void>;
  confirmAddCredits: (amount: number) => Promise<void>;
  setDeleteDialogOpen: (open: boolean) => void;
  setAddCreditsDialogOpen: (open: boolean) => void;
  handleUserActionComplete: () => void;
}

export const useUserDialogHandlers = ({
  confirmDeleteUser,
  confirmAddCredits,
  setDeleteDialogOpen,
  setAddCreditsDialogOpen,
  handleUserActionComplete
}: UseUserDialogHandlersProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Xác nhận xóa người dùng với cải thiện xử lý cache
  const handleConfirmDeleteUser = useCallback(async () => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await confirmDeleteUser();
      
      // Thông báo thành công ngay lập tức
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công",
      });
      
      // Xóa cache trước khi đóng dialog
      clearAllUserCache();
      
      // Đóng dialog trước khi làm mới dữ liệu
      setDeleteDialogOpen(false);
      
      // Đợi một chút trước khi làm mới dữ liệu để UI có thời gian phản hồi
      setTimeout(() => {
        handleUserActionComplete();
      }, 300);
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      setIsProcessing(false);
      // Không cần xử lý lỗi ở đây vì đã xử lý trong DeleteUserDialog
    }
  }, [confirmDeleteUser, handleUserActionComplete, toast, setDeleteDialogOpen, isProcessing]);

  // Xác nhận thêm credits với cải thiện xử lý cache
  const handleConfirmAddCredits = useCallback(async (amount: number) => {
    if (isProcessing) return;
    
    try {
      setIsProcessing(true);
      await confirmAddCredits(amount);
      
      // Thông báo thành công ngay lập tức
      toast({
        title: "Thành công",
        description: "Đã thêm credits thành công",
      });
      
      // Xóa cache trước khi đóng dialog
      clearAllUserCache();
      
      // Đóng dialog
      setAddCreditsDialogOpen(false);
      
      // Đợi một chút trước khi làm mới dữ liệu để UI có thời gian phản hồi
      setTimeout(() => {
        handleUserActionComplete();
      }, 300);
    } catch (error) {
      console.error("Lỗi khi thêm credits:", error);
      setIsProcessing(false);
      
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm credits",
        variant: "destructive"
      });
    }
  }, [confirmAddCredits, setAddCreditsDialogOpen, handleUserActionComplete, toast, isProcessing]);

  return {
    handleConfirmDeleteUser,
    handleConfirmAddCredits,
    isProcessing
  };
};
