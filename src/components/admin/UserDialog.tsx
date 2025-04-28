
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
import { useToast } from "@/hooks/use-toast";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | number;
  onUserSaved: () => void;
}

const UserDialog = ({ isOpen, onClose, userId, onUserSaved }: UserDialogProps) => {
  const {
    user,
    isLoading,
    error,
    isSubmitting,
    setIsSubmitting,
    isMounted,
    fetchUser,
    resetDialog,
  } = useUserDialog(userId, isOpen, onClose);
  
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) {
      resetDialog();
    }
  }, [isOpen, resetDialog]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUser();
    }
  }, [fetchUser, isOpen, userId]);

  const handleSubmit = async (data: UserFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      console.log("Đang lưu thông tin user:", data);
      
      if (isMounted.current) {
        toast({
          title: "Thành công",
          description: userId ? "Cập nhật thông tin người dùng thành công" : "Tạo người dùng mới thành công"
        });
      }
      
      if (isMounted.current) {
        onClose();
        setTimeout(() => {
          onUserSaved();
        }, 300);
      }
    } catch (error: any) {
      console.error("Lỗi khi lưu thông tin user:", error);
      
      if (isMounted.current) {
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
  };

  const handleDialogClose = () => {
    if (!isLoading && !isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent 
        className="sm:max-w-[600px]" 
        onInteractOutside={(e) => {
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
            onSubmit={handleSubmit}
            onCancel={handleDialogClose}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
