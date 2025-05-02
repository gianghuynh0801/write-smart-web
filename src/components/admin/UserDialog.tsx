
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserFormValues } from "@/types/user";
import UserForm from "./UserForm";
import { useUserDialog } from "./users/hooks/useUserDialog";
import { UserDialogError } from "./users/components/UserDialogError";
import { UserDialogLoading } from "./users/components/UserDialogLoading";
import { useUserDialogSubmit } from "./users/hooks/useUserDialogSubmit";
import { useUserDialogState } from "./users/hooks/useUserDialogState";
import { useUserDialogEffects } from "./users/hooks/useUserDialogEffects";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | number;
  onUserSaved: () => void;
}

const UserDialog = ({ isOpen, onClose, userId, onUserSaved }: UserDialogProps) => {
  // Khởi tạo hook chính để lấy thông tin user
  const {
    user,
    isLoading,
    error,
    isMounted,
    fetchUser,
    resetDialog,
  } = useUserDialog(userId, isOpen, onClose);
  
  // Hook xử lý việc gửi form
  const {
    isSubmitting,
    setIsSubmitting,
    handleSubmit,
    saveSuccessful,
    setSaveSuccessful
  } = useUserDialogSubmit({ userId, onClose, onUserSaved });

  // Hook quản lý trạng thái của dialog
  const { 
    isClosing, 
    setIsClosing 
  } = useUserDialogState({ isOpen, saveSuccessful, onUserSaved, isMounted });

  // Hook xử lý các side effects
  useUserDialogEffects({
    fetchUser,
    isOpen,
    userId,
    isClosing,
    isMounted,
    resetDialog
  });

  // Xử lý đóng dialog
  const handleDialogClose = () => {
    if (isLoading || isSubmitting) return;
    setIsClosing(true);
    onClose();
  };

  // Xử lý submit form
  const handleFormSubmit = async (data: UserFormValues) => {
    await handleSubmit(data, isClosing);
  };

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) handleDialogClose();
      }}
    >
      <DialogContent 
        className="sm:max-w-[600px]" 
        onInteractOutside={(e) => {
          if (isLoading || isSubmitting) {
            e.preventDefault();
          }
        }}
        onEscapeKeyDown={(e) => {
          if (isLoading || isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{userId ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
          <DialogDescription>
            {userId ? "Cập nhật thông tin người dùng" : "Nhập thông tin cho người dùng mới"}
          </DialogDescription>
        </DialogHeader>
        
        {error ? (
          <UserDialogError error={error} onRetry={() => fetchUser()} />
        ) : isLoading && !user ? (
          <UserDialogLoading />
        ) : (
          <UserForm 
            user={user}
            onSubmit={handleFormSubmit}
            onCancel={handleDialogClose}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
