
import { useState } from "react";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { deleteUser, addUserCredits } from "@/api/userService";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { clearAllUserCache } from "@/utils/api/userApiUtils";

export const useUserActions = (refreshUsers: () => Promise<void>) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addCreditsDialogOpen, setAddCreditsDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | number | undefined>(undefined);
  const [isCreditUpdating, setIsCreditUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();
  const { sendVerificationEmail } = useEmailVerification();

  // Xử lý thêm tín dụng
  const handleAddCredits = (user: User) => {
    setSelectedUser(user);
    setAddCreditsDialogOpen(true);
  };

  // Xử lý xóa người dùng
  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Xử lý chỉnh sửa người dùng
  const handleEditUser = (userId: string | number) => {
    setEditUserId(userId);
    setUserDialogOpen(true);
  };

  // Xử lý thêm người dùng mới
  const handleAddUser = () => {
    setEditUserId(undefined);
    setUserDialogOpen(true);
  };

  // Xác nhận xóa người dùng
  const confirmDeleteUser = async () => {
    if (!selectedUser) {
      throw new Error("Không có người dùng được chọn để xóa");
    }
    
    try {
      setIsDeleting(true);
      
      await deleteUser(selectedUser.id);
      
      clearAllUserCache(); // Xóa cache để đảm bảo dữ liệu mới
      
      // Làm mới danh sách người dùng
      try {
        await refreshUsers();
      } catch (refreshError) {
        console.error("Lỗi khi làm mới danh sách sau khi xóa:", refreshError);
        // Không throw lỗi ở đây vì người dùng đã được xóa thành công
      }
      
      setDeleteDialogOpen(false);
      setIsDeleting(false);
      
      return Promise.resolve(); // Trả về Promise hoàn thành để xử lý tiếp theo
    } catch (error) {
      console.error("Lỗi khi xóa người dùng:", error);
      setIsDeleting(false);
      throw error; // Throw lỗi để xử lý ở DeleteUserDialog
    }
  };

  // Xác nhận thêm tín dụng
  const confirmAddCredits = async (amount: number) => {
    if (!selectedUser || amount <= 0) {
      throw new Error("Không thể thêm số tín dụng không hợp lệ");
    }
    
    try {
      setIsCreditUpdating(true);
      
      await addUserCredits(selectedUser.id, amount);
      
      clearAllUserCache(); // Xóa cache để đảm bảo dữ liệu mới
      
      // Làm mới danh sách người dùng
      try {
        await refreshUsers();
      } catch (refreshError) {
        console.error("Lỗi khi làm mới danh sách sau khi thêm credits:", refreshError);
      }
      
      setIsCreditUpdating(false);
      return Promise.resolve();
    } catch (error) {
      setIsCreditUpdating(false);
      throw error;
    }
  };

  // Gửi lại email xác thực
  const handleResendVerification = async (user: User) => {
    if (!user || !user.email) return;
    
    try {
      await sendVerificationEmail({
        email: user.email,
        name: user.name,
        userId: user.id.toString(),
        type: "email_verification"
      });
      
      toast({
        title: "Đã gửi email xác thực",
        description: `Đã gửi lại email xác thực cho ${user.name}.`,
      });
    } catch (error: any) {
      console.error("Lỗi khi gửi lại email xác thực:", error);
      
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi lại email xác thực.",
        variant: "destructive"
      });
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
    handleAddCredits,
    handleEditUser,
    handleAddUser,
    handleResendVerification,
    confirmDeleteUser,
    confirmAddCredits,
    setDeleteDialogOpen,
    setAddCreditsDialogOpen,
    setUserDialogOpen
  };
};
