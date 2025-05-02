
import { useEffect } from "react";

interface UseUserDialogEffectsProps {
  fetchUser: () => void;
  isOpen: boolean;
  userId?: string | number;
  isClosing: boolean;
  isMounted: React.MutableRefObject<boolean>;
  resetDialog: () => void;
}

export const useUserDialogEffects = ({
  fetchUser,
  isOpen,
  userId,
  isClosing,
  isMounted,
  resetDialog
}: UseUserDialogEffectsProps) => {
  // Reset dialog khi đóng
  useEffect(() => {
    if (!isOpen) {
      resetDialog();
    }
  }, [isOpen, resetDialog]);

  // Kiểm soát mounting
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, [isMounted]);

  // Chỉ fetch user data khi dialog mở và có userId
  useEffect(() => {
    if (isOpen && userId && !isClosing) {
      // Thêm độ trễ nhỏ để tránh gửi quá nhiều request ngay khi dialog mở
      const timer = setTimeout(() => {
        if (isMounted.current && isOpen) {
          fetchUser();
        }
      }, 300); // Tăng thêm độ trễ để tránh fetch quá sớm
      
      return () => clearTimeout(timer);
    }
  }, [fetchUser, isOpen, userId, isClosing, isMounted]);
};
