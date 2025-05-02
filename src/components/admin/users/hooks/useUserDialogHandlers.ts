
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
  const [processingTimeoutId, setProcessingTimeoutId] = useState<number | null>(null);

  // Hàm reset trạng thái xử lý
  const resetProcessingState = useCallback(() => {
    setIsProcessing(false);
    if (processingTimeoutId) {
      clearTimeout(processingTimeoutId);
      setProcessingTimeoutId(null);
    }
  }, [processingTimeoutId]);

  // Xác nhận xóa người dùng với cải thiện xử lý cache và trạng thái
  const handleConfirmDeleteUser = useCallback(async () => {
    if (isProcessing) return;
    
    // Xóa timeout hiện tại nếu có
    if (processingTimeoutId) {
      clearTimeout(processingTimeoutId);
      setProcessingTimeoutId(null);
    }
    
    try {
      setIsProcessing(true);
      
      // Thiết lập timeout an toàn để tránh treo UI vĩnh viễn
      const timeoutId = window.setTimeout(() => {
        console.log("[useUserDialogHandlers] Vượt quá thời gian xử lý, tự động reset trạng thái");
        setIsProcessing(false);
        
        toast({
          title: "Cảnh báo",
          description: "Quá trình xóa người dùng mất nhiều thời gian. Vui lòng thử lại sau.",
          variant: "destructive" // Thay đổi từ "warning" sang "destructive"
        });
        
        setDeleteDialogOpen(false);
      }, 8000); // 8 giây là thời gian tối đa cho phép
      
      setProcessingTimeoutId(timeoutId);
      
      // Thực hiện xóa người dùng
      await confirmDeleteUser();
      
      // Xóa timeout an toàn vì đã xử lý thành công
      clearTimeout(timeoutId);
      setProcessingTimeoutId(null);
      
      // Thông báo thành công ngay lập tức
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công",
      });
      
      // Xóa cache trước khi đóng dialog để tránh hiển thị dữ liệu cũ
      clearAllUserCache();
      
      // Đóng dialog và reset trạng thái
      setDeleteDialogOpen(false);
      setIsProcessing(false);
      
      // Đợi một chút trước khi làm mới dữ liệu để UI có thời gian phản hồi
      // Sử dụng thời gian dài hơn để tránh đóng băng giao diện
      setTimeout(() => {
        handleUserActionComplete();
      }, 500);
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      
      // Reset trạng thái xử lý khi có lỗi
      resetProcessingState();
      
      // Hiển thị thông báo lỗi
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa người dùng",
        variant: "destructive"
      });
    }
  }, [confirmDeleteUser, handleUserActionComplete, toast, setDeleteDialogOpen, isProcessing, processingTimeoutId, resetProcessingState]);

  // Xác nhận thêm credits với cải thiện xử lý cache
  const handleConfirmAddCredits = useCallback(async (amount: number) => {
    if (isProcessing) return;
    
    // Xóa timeout hiện tại nếu có
    if (processingTimeoutId) {
      clearTimeout(processingTimeoutId);
      setProcessingTimeoutId(null);
    }
    
    try {
      setIsProcessing(true);
      
      // Thiết lập timeout an toàn
      const timeoutId = window.setTimeout(() => {
        console.log("[useUserDialogHandlers] Vượt quá thời gian xử lý credits, tự động reset trạng thái");
        setIsProcessing(false);
        
        toast({
          title: "Cảnh báo",
          description: "Quá trình thêm credits mất nhiều thời gian. Vui lòng thử lại sau.",
          variant: "destructive" // Thay đổi từ "warning" sang "destructive"
        });
        
        setAddCreditsDialogOpen(false);
      }, 8000);
      
      setProcessingTimeoutId(timeoutId);
      
      await confirmAddCredits(amount);
      
      // Xóa timeout an toàn
      clearTimeout(timeoutId);
      setProcessingTimeoutId(null);
      
      // Thông báo thành công ngay lập tức
      toast({
        title: "Thành công",
        description: "Đã thêm credits thành công",
      });
      
      // Xóa cache trước khi đóng dialog
      clearAllUserCache();
      
      // Đóng dialog và reset trạng thái
      setAddCreditsDialogOpen(false);
      setIsProcessing(false);
      
      // Đợi một chút trước khi làm mới dữ liệu
      setTimeout(() => {
        handleUserActionComplete();
      }, 500);
    } catch (error) {
      console.error("Lỗi khi thêm credits:", error);
      
      // Reset trạng thái xử lý khi có lỗi
      resetProcessingState();
      
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm credits",
        variant: "destructive"
      });
    }
  }, [confirmAddCredits, setAddCreditsDialogOpen, handleUserActionComplete, toast, isProcessing, processingTimeoutId, resetProcessingState]);

  return {
    handleConfirmDeleteUser,
    handleConfirmAddCredits,
    isProcessing,
    resetProcessingState
  };
};

