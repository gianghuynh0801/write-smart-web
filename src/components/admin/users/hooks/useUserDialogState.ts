
import { useState, useEffect } from "react";

interface UseUserDialogStateProps {
  isOpen: boolean;
  saveSuccessful: boolean;
  onUserSaved: () => void;
  isMounted: React.MutableRefObject<boolean>;
}

export const useUserDialogState = ({
  isOpen,
  saveSuccessful,
  onUserSaved,
  isMounted
}: UseUserDialogStateProps) => {
  const [isClosing, setIsClosing] = useState(false);

  // Reset dialog khi đóng
  useEffect(() => {
    if (!isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Reset trạng thái đóng khi dialog mở lại
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Chạy callback onUserSaved khi lưu thành công và dialog đã đóng
  useEffect(() => {
    if (!isOpen && saveSuccessful) {
      console.log("[UserDialogState] Dialog đã đóng và đã lưu thành công, gọi onUserSaved");
      
      // Tạo delay dài hơn để đảm bảo các tác vụ nền đã hoàn tất
      const timer = setTimeout(() => {
        if (isMounted.current) {
          onUserSaved();
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, saveSuccessful, onUserSaved, isMounted]);

  return {
    isClosing,
    setIsClosing
  };
};
