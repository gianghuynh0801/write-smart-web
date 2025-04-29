
import { useCallback } from "react";

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
  
  // Xử lý xóa người dùng
  const handleConfirmDeleteUser = useCallback(async () => {
    try {
      await confirmDeleteUser();
      setDeleteDialogOpen(false);
      // Làm mới dữ liệu sau khi xóa
      handleUserActionComplete();
    } catch (error) {
      console.error("[AdminUsers] Lỗi khi xóa người dùng:", error);
    }
  }, [confirmDeleteUser, setDeleteDialogOpen, handleUserActionComplete]);

  // Xử lý thêm credits
  const handleConfirmAddCredits = useCallback(async (amount: number) => {
    try {
      await confirmAddCredits(amount);
      setAddCreditsDialogOpen(false);
      // Làm mới dữ liệu sau khi thêm credits
      handleUserActionComplete();
    } catch (error) {
      console.error("[AdminUsers] Lỗi khi thêm credits:", error);
    }
  }, [confirmAddCredits, setAddCreditsDialogOpen, handleUserActionComplete]);

  return {
    handleConfirmDeleteUser,
    handleConfirmAddCredits
  };
};
