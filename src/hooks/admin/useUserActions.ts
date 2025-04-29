
import { useState } from "react";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { deleteUser, addUserCredits } from "@/api/userService";
import { useEmailVerification } from "@/hooks/useEmailVerification";

export const useUserActions = (refreshUsers: () => Promise<void>) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addCreditsDialogOpen, setAddCreditsDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | number | undefined>(undefined);
  const [isCreditUpdating, setIsCreditUpdating] = useState(false);

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
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.id);
      
      toast({
        title: "Đã xóa người dùng",
        description: `Đã xóa người dùng ${selectedUser.name} thành công.`,
      });
      
      setDeleteDialogOpen(false);
      refreshUsers();
    } catch (error: any) {
      console.error("Lỗi khi xóa người dùng:", error);
      
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa người dùng.",
        variant: "destructive"
      });
    }
  };

  // Xác nhận thêm tín dụng
  const confirmAddCredits = async (amount: number) => {
    if (!selectedUser || amount <= 0) return;
    
    try {
      setIsCreditUpdating(true);
      
      await addUserCredits(selectedUser.id, amount);
      
      toast({
        title: "Đã thêm tín dụng",
        description: `Đã thêm ${amount} tín dụng cho ${selectedUser.name}.`,
      });
      
      setAddCreditsDialogOpen(false);
      refreshUsers();
    } catch (error: any) {
      console.error("Lỗi khi thêm tín dụng:", error);
      
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm tín dụng.",
        variant: "destructive"
      });
    } finally {
      setIsCreditUpdating(false);
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
