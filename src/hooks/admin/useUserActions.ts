
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { deleteUser } from "@/api/userService";
import { addUserCredits } from "@/api/user/userCredits";
import { User } from "@/types/user";
import { useEmailVerification } from "@/hooks/useEmailVerification";

export const useUserActions = (onUserUpdated: () => void) => {
  const [isCreditUpdating, setIsCreditUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addCreditsDialogOpen, setAddCreditsDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserId, setEditUserId] = useState<string | number | undefined>(undefined);
  const { toast } = useToast();
  const { sendVerificationEmail } = useEmailVerification();

  const handleDeleteUser = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast({
        title: "Đã xóa người dùng",
        description: `Người dùng ${selectedUser.name} đã được xóa thành công`
      });
      // Đảm bảo UI được cập nhật sau khi xóa
      onUserUpdated();
    } catch (error) {
      console.error("[useUserActions] Lỗi khi xóa người dùng:", error);
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const handleAddCredits = (user: User) => {
    setSelectedUser(user);
    setAddCreditsDialogOpen(true);
  };

  const confirmAddCredits = async (amount: number) => {
    if (!selectedUser) return;
    setIsCreditUpdating(true);
    
    try {
      console.log(`[useUserActions] Thêm ${amount} tín dụng cho ${selectedUser.name} (${selectedUser.id})`);
      await addUserCredits(selectedUser.id, amount);
      
      toast({
        title: "Thêm tín dụng",
        description: `Đã thêm ${amount} tín dụng cho người dùng ${selectedUser.name}`
      });
      
      // Đảm bảo UI được cập nhật sau khi thêm tín dụng
      onUserUpdated();
    } catch (error) {
      console.error("[useUserActions] Lỗi khi thêm tín dụng:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm tín dụng",
        variant: "destructive"
      });
    } finally {
      setIsCreditUpdating(false);
      setAddCreditsDialogOpen(false);
    }
  };

  const handleEditUser = (userId: string | number) => {
    console.log("[useUserActions] Mở dialog chỉnh sửa cho user:", userId);
    setEditUserId(userId);
    setUserDialogOpen(true);
  };

  const handleAddUser = () => {
    setEditUserId(undefined);
    setUserDialogOpen(true);
  };

  const handleResendVerification = async (user: User) => {
    try {
      toast({
        title: "Đang gửi",
        description: `Đang gửi email xác thực đến ${user.email}...`,
      });
      
      await sendVerificationEmail({
        email: user.email,
        userId: String(user.id),
        name: user.name,
        type: "email_verification"
      });
      
      toast({
        title: "Đã gửi email xác thực",
        description: `Email xác thực đã được gửi đến ${user.email}`
      });
    } catch (error) {
      console.error("[useUserActions] Lỗi khi gửi email xác thực:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi email xác thực",
        variant: "destructive"
      });
    }
  };

  return {
    isCreditUpdating,
    deleteDialogOpen,
    addCreditsDialogOpen,
    userDialogOpen,
    selectedUser,
    editUserId,
    handleDeleteUser,
    confirmDeleteUser,
    handleAddCredits,
    confirmAddCredits,
    handleEditUser,
    handleAddUser,
    handleResendVerification,
    setDeleteDialogOpen,
    setAddCreditsDialogOpen,
    setUserDialogOpen
  };
};
