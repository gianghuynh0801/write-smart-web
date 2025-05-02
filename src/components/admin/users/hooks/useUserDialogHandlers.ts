
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { clearUserCache, clearUsersCache } from "@/utils/api/userApiUtils";

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

  // Xác nhận xóa người dùng với tải lại trang
  const handleConfirmDeleteUser = useCallback(async () => {
    try {
      await confirmDeleteUser();
      setDeleteDialogOpen(false);
      
      // Xóa toàn bộ cache
      clearUsersCache();
      
      // Báo cáo hành động hoàn thành
      handleUserActionComplete();
      
      // Thêm tải lại trang sau khi xóa
      setTimeout(() => {
        window.location.reload();
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

  // Xác nhận thêm credits với tải lại trang
  const handleConfirmAddCredits = useCallback(async (amount: number) => {
    try {
      await confirmAddCredits(amount);
      setAddCreditsDialogOpen(false);
      
      // Xóa toàn bộ cache
      clearUsersCache();
      
      // Báo cáo hành động hoàn thành
      handleUserActionComplete();
      
      // Thêm tải lại trang sau khi thêm credits
      setTimeout(() => {
        window.location.reload();
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
