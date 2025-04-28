
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
import { updateUser, createUser } from "@/api/user/userMutations";
import { getItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

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

  const verifyAdminSession = async () => {
    try {
      // Kiểm tra session token trong localStorage
      const sessionToken = getItem<string>(LOCAL_STORAGE_KEYS.SESSION_TOKEN, false);
      if (!sessionToken) {
        console.log("[UserDialog] Không tìm thấy session token");
        toast({
          title: "Lỗi xác thực",
          description: "Phiên đăng nhập hết hạn hoặc không tồn tại. Vui lòng đăng nhập lại.",
          variant: "destructive"
        });
        throw new Error("Không tìm thấy session token");
      }
      console.log("[UserDialog] Đã tìm thấy session token");
      return true;
    } catch (error) {
      console.error("[UserDialog] Lỗi khi xác thực session:", error);
      return false;
    }
  };

  const handleSubmit = async (data: UserFormValues) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      console.log("[UserDialog] Đang lưu thông tin user:", data);
      
      // Kiểm tra session trước khi thực hiện thao tác
      const sessionValid = await verifyAdminSession();
      if (!sessionValid) {
        throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
      }
      
      if (userId) {
        // Cập nhật người dùng hiện có
        await updateUser(userId, data);
        console.log("[UserDialog] Đã cập nhật thông tin người dùng thành công");
      } else {
        // Tạo người dùng mới
        await createUser(data);
        console.log("[UserDialog] Đã tạo người dùng mới thành công");
      }
      
      if (isMounted.current) {
        toast({
          title: "Thành công",
          description: userId ? "Cập nhật thông tin người dùng thành công" : "Tạo người dùng mới thành công"
        });
      }
      
      if (isMounted.current) {
        onClose();
        // Đảm bảo onUserSaved được gọi sau khi đã đóng dialog
        setTimeout(() => {
          onUserSaved();
        }, 300);
      }
    } catch (error: any) {
      console.error("[UserDialog] Lỗi khi lưu thông tin user:", error);
      
      // Kiểm tra nếu là lỗi liên quan đến xác thực
      const errorMsg = error.message || "";
      if (errorMsg.includes("auth") || errorMsg.includes("phiên") || 
          errorMsg.includes("token") || errorMsg.includes("xác thực")) {
        toast({
          title: "Lỗi xác thực",
          description: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại để tiếp tục.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Lỗi",
          description: errorMsg || "Có lỗi xảy ra khi lưu thông tin",
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
