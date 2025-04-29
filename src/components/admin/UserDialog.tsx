
import { useEffect, useState } from "react";
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
import { authService, isAuthError } from "@/services/auth";

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
  const [isClosing, setIsClosing] = useState(false);

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
    if (isOpen && userId && !isClosing) {
      // Thêm độ trễ nhỏ để tránh gửi quá nhiều request ngay khi dialog mở
      const timer = setTimeout(() => {
        if (isMounted.current && isOpen) {
          fetchUser();
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [fetchUser, isOpen, userId, isClosing]);

  const handleSubmit = async (data: UserFormValues) => {
    if (isSubmitting || isClosing) return;
    setIsSubmitting(true);

    try {
      console.log("[UserDialog] Đang lưu thông tin user:", data);
      
      // Lấy token admin trước khi thực hiện
      await authService.getAdminToken();
      
      let successMessage = "";
      let success = false;
      
      if (userId) {
        // Cập nhật người dùng hiện có
        await updateUser(userId, data);
        console.log("[UserDialog] Đã cập nhật thông tin người dùng thành công");
        successMessage = "Cập nhật thông tin người dùng thành công";
        success = true;
      } else {
        // Tạo người dùng mới
        await createUser(data);
        console.log("[UserDialog] Đã tạo người dùng mới thành công");
        successMessage = "Tạo người dùng mới thành công";
        success = true;
      }
      
      if (isMounted.current && success) {
        // Đánh dấu đang đóng dialog để tránh fetch dữ liệu không cần thiết
        setIsClosing(true);
        
        // Đóng dialog trước khi hiển thị thông báo thành công
        onClose();
        
        // Hiển thị thông báo thành công sau khi đóng dialog
        setTimeout(() => {
          if (isMounted.current) {
            toast({
              title: "Thành công",
              description: successMessage
            });
            
            // Delay refresh dữ liệu để tránh đóng băng UI và đảm bảo dialog đã đóng
            setTimeout(() => {
              if (isMounted.current) {
                onUserSaved();
              }
            }, 600);
          }
        }, 300);
      }
    } catch (error: any) {
      console.error("[UserDialog] Lỗi khi lưu thông tin user:", error);
      
      if (!isMounted.current) return;
      
      // Kiểm tra nếu là lỗi xác thực
      if (isAuthError(error)) {
        try {
          console.log("[UserDialog] Phát hiện lỗi xác thực, đang thử làm mới token...");
          const hasNewToken = await authService.handleAuthError(error);
          
          if (hasNewToken) {
            console.log("[UserDialog] Đã làm mới token thành công, đang thử lại...");
            
            try {
              let success = false;
              
              if (userId) {
                await updateUser(userId, data);
                console.log("[UserDialog] Đã cập nhật thông tin người dùng thành công sau khi làm mới token");
                success = true;
              } else {
                await createUser(data);
                console.log("[UserDialog] Đã tạo người dùng mới thành công sau khi làm mới token");
                success = true;
              }
              
              if (isMounted.current && success) {
                setIsClosing(true);
                onClose();
                
                // Hiển thị thông báo thành công sau khi đóng dialog
                setTimeout(() => {
                  if (isMounted.current) {
                    toast({
                      title: "Thành công",
                      description: userId ? "Cập nhật thông tin người dùng thành công" : "Tạo người dùng mới thành công"
                    });
                    
                    // Delay refresh dữ liệu để tránh đóng băng UI
                    setTimeout(() => {
                      if (isMounted.current) {
                        onUserSaved();
                      }
                    }, 600);
                  }
                }, 300);
              }
              
              return;
            } catch (retryError: any) {
              if (!isMounted.current) return;
              console.error("[UserDialog] Lỗi khi thử lại:", retryError);
              throw retryError;
            }
          }
          
          if (isMounted.current) {
            toast({
              title: "Lỗi xác thực",
              description: "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại để tiếp tục.",
              variant: "destructive"
            });
          }
        } catch (refreshError) {
          if (!isMounted.current) return;
          console.error("[UserDialog] Lỗi khi làm mới token:", refreshError);
          toast({
            title: "Lỗi xác thực",
            description: "Không thể làm mới phiên đăng nhập. Vui lòng đăng nhập lại.",
            variant: "destructive"
          });
        }
      } else if (isMounted.current) {
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
    if (isLoading || isSubmitting) return;
    
    setIsClosing(true);
    onClose();
  };

  // Reset trạng thái đóng khi dialog mở lại
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

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
