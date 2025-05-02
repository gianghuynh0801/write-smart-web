
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { clearUserCache, clearUsersCache, clearAllUserCache } from "@/utils/api/userApiUtils";

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

  // Xác nhận xóa người dùng với cải thiện xử lý cache
  const handleConfirmDeleteUser = useCallback(async () => {
    try {
      await confirmDeleteUser();
      setDeleteDialogOpen(false);
      
      // Xóa toàn bộ cache - sử dụng clearAllUserCache thay vì chỉ xóa users cache
      clearAllUserCache();
      
      // Báo cáo hành động hoàn thành
      handleUserActionComplete();
      
      toast({
        title: "Thành công",
        description: "Đã xóa người dùng thành công",
      });
      
      // Tải lại trang sau 1 giây để đảm bảo dữ liệu mới nhất
      setTimeout(() => {
        toast({
          title: "Đang làm mới dữ liệu",
          description: "Trang sẽ được tải lại để cập nhật danh sách người dùng",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể xóa người dùng",
        variant: "destructive"
      });
    }
  }, [confirmDeleteUser, setDeleteDialogOpen, handleUserActionComplete, toast]);

  // Xác nhận thêm credits với cải thiện xử lý cache
  const handleConfirmAddCredits = useCallback(async (amount: number) => {
    try {
      await confirmAddCredits(amount);
      setAddCreditsDialogOpen(false);
      
      // Xóa toàn bộ cache - sử dụng clearAllUserCache thay vì chỉ xóa users cache
      clearAllUserCache();
      
      // Báo cáo hành động hoàn thành
      handleUserActionComplete();
      
      toast({
        title: "Thành công",
        description: "Đã thêm credits thành công",
      });
      
      // Tải lại trang sau 1 giây để đảm bảo dữ liệu mới nhất
      setTimeout(() => {
        toast({
          title: "Đang làm mới dữ liệu",
          description: "Trang sẽ được tải lại để cập nhật danh sách người dùng",
        });
        
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }, 1000);
    } catch (error) {
      console.error("Lỗi khi thêm credits:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể thêm credits",
        variant: "destructive"
      });
    }
  }, [confirmAddCredits, setAddCreditsDialogOpen, handleUserActionComplete, toast]);

  return {
    handleConfirmDeleteUser,
    handleConfirmAddCredits
  };
};
