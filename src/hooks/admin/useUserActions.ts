import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/user";
import { deleteUser } from "@/api/user/userMutations";
import { authService } from "@/services/authService";

export const useUserActions = (refreshUsers: () => Promise<any>) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addCreditsDialogOpen, setAddCreditsDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | number | undefined>();
  const [isCreditUpdating, setIsCreditUpdating] = useState(false);
  const { toast } = useToast();
  const isMounted = useRef(true);
  
  // Theo dõi trạng thái các operation đang thực hiện
  const [isDeleting, setIsDeleting] = useState(false);

  // Quản lý hành động xóa người dùng
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser || isDeleting) return;

    try {
      setIsDeleting(true);
      console.log("Đang xóa người dùng:", selectedUser.id);
      
      // Lấy admin token trước khi thực hiện
      await authService.getAdminToken();
      
      await deleteUser(selectedUser.id);
      
      if (isMounted.current) {
        toast({
          title: "Thành công",
          description: `Đã xóa người dùng ${selectedUser.name}`,
        });
        
        // Đóng dialog và làm mới danh sách
        setDeleteDialogOpen(false);
        refreshUsers();
      }
    } catch (error: any) {
      console.error("Lỗi khi xóa người dùng:", error);
      
      // Kiểm tra nếu là lỗi xác thực, thử làm mới token
      if (authService.isAuthError(error)) {
        console.log("Phát hiện lỗi xác thực, đang thử làm mới token...");
        
        try {
          // Làm mới token
          const hasNewToken = await authService.handleAuthError(error);
          
          if (hasNewToken && selectedUser && isMounted.current) {
            console.log("Đã làm mới token, đang thử xóa lại...");
            
            try {
              await deleteUser(selectedUser.id);
              
              if (isMounted.current) {
                toast({
                  title: "Thành công",
                  description: `Đã xóa người dùng ${selectedUser.name}`,
                });
                
                setDeleteDialogOpen(false);
                refreshUsers();
                return;
              }
            } catch (retryError) {
              console.error("Thử lại thất bại:", retryError);
            }
          }
        } catch (refreshError) {
          console.error("Lỗi khi làm mới token:", refreshError);
        }
      }
      
      // Xử lý lỗi chung hoặc thử lại thất bại
      if (isMounted.current) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể xóa người dùng",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  };

  // Quản lý hành động thêm credits
  const handleAddCredits = (user: User) => {
    setSelectedUser(user);
    setAddCreditsDialogOpen(true);
  };

  const confirmAddCredits = async (amount: number) => {
    if (!selectedUser) return;

    setIsCreditUpdating(true);
    
    try {
      // Triển khai logic thêm credits ở đây
      console.log(`Đang thêm ${amount} credits cho người dùng ${selectedUser.name}`);
      
      // Giả lập một cập nhật credits thành công
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isMounted.current) {
        toast({
          title: "Thành công",
          description: `Đã thêm ${amount} credits cho ${selectedUser.name}`,
        });
        
        setAddCreditsDialogOpen(false);
        refreshUsers();
      }
    } catch (error: any) {
      console.error("Lỗi khi thêm credits:", error);
      
      if (isMounted.current) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể thêm credits",
          variant: "destructive",
        });
      }
    } finally {
      if (isMounted.current) {
        setIsCreditUpdating(false);
      }
    }
  };

  // Quản lý hành động chỉnh sửa người dùng
  const handleEditUser = (userId: string | number) => {
    setEditUserId(userId);
    setUserDialogOpen(true);
  };

  // Quản lý hành động thêm người dùng mới
  const handleAddUser = () => {
    setEditUserId(undefined);
    setUserDialogOpen(true);
  };
  
  // Quản lý hành động gửi lại email xác thực
  const handleResendVerification = async (user: User) => {
    try {
      console.log("Đang gửi lại email xác thực cho:", user.email);
      
      // Giả lập gửi email xác thực
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (isMounted.current) {
        toast({
          title: "Thành công",
          description: `Đã gửi lại email xác thực cho ${user.email}`,
        });
      }
    } catch (error: any) {
      console.error("Lỗi khi gửi lại email xác thực:", error);
      
      if (isMounted.current) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể gửi lại email xác thực",
          variant: "destructive",
        });
      }
    }
  };

  return {
    selectedUser,
    deleteDialogOpen,
    addCreditsDialogOpen,
    userDialogOpen,
    editUserId,
    isCreditUpdating,
    isDeleting,
    handleDeleteUser,
    confirmDeleteUser,
    handleAddCredits,
    confirmAddCredits,
    handleEditUser,
    handleAddUser,
    handleResendVerification,
    setDeleteDialogOpen,
    setAddCreditsDialogOpen,
    setUserDialogOpen,
  };
};
