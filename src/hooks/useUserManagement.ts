
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsers, deleteUser } from "@/api/userService";
import { addUserCredits } from "@/api/user/userCredits";
import { User } from "@/types/user";
import { useEmailVerification } from "@/hooks/useEmailVerification";

export const useUserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreditUpdating, setIsCreditUpdating] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addCreditsDialogOpen, setAddCreditsDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editUserId, setEditUserId] = useState<string | number | undefined>(undefined);
  const pageSize = 5;
  const { toast } = useToast();
  const { sendVerificationEmail } = useEmailVerification();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    console.log("[useUserManagement] Đang tải danh sách người dùng...");
    try {
      const result = await fetchUsers(currentPage, pageSize, status, searchTerm);
      
      if (result.data.length === 0 && currentPage > 1) {
        // Nếu không có dữ liệu và đang ở trang > 1, quay lại trang 1
        setCurrentPage(1);
        return;
      }
      
      // Đảm bảo người dùng có thuộc tính subscription đúng
      const enhancedUsers = result.data.map(user => ({
        ...user,
        subscription: user.subscription || "Không có"
      }));
      
      setUsers(enhancedUsers);
      setTotalUsers(result.total);
      console.log(`[useUserManagement] Đã tải ${enhancedUsers.length} người dùng, tổng số: ${result.total}`);
    } catch (error) {
      console.error("[useUserManagement] Lỗi khi tải danh sách người dùng:", error);
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách người dùng",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, status, searchTerm, toast]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
      loadUsers();
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa người dùng",
        variant: "destructive"
      });
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
      console.log(`[useUserManagement] Thêm ${amount} tín dụng cho ${selectedUser.name} (${selectedUser.id})`);
      await addUserCredits(selectedUser.id, amount);
      
      // Thông báo thành công
      toast({
        title: "Thêm tín dụng",
        description: `Đã thêm ${amount} tín dụng cho người dùng ${selectedUser.name}`
      });
      
      // Tải lại danh sách người dùng để cập nhật số dư mới
      await loadUsers();
    } catch (error) {
      console.error("[useUserManagement] Lỗi khi thêm tín dụng:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm tín dụng",
        variant: "destructive"
      });
    } finally {
      setIsCreditUpdating(false);
    }
  };

  const handleEditUser = (userId: string | number) => {
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
      console.error("Error sending verification email:", error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi email xác thực",
        variant: "destructive"
      });
    }
  };

  // Tải danh sách người dùng ban đầu
  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return {
    users,
    totalUsers,
    isLoading,
    isCreditUpdating,
    searchTerm,
    status,
    currentPage,
    pageSize,
    selectedUser,
    deleteDialogOpen,
    addCreditsDialogOpen,
    userDialogOpen,
    editUserId,
    loadUsers,
    handleSearch,
    handleStatusChange,
    handlePageChange,
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
    getRoleColor: (role: string) => {
      switch (role) {
        case "admin":
          return "bg-red-100 text-red-800";
        case "editor":
          return "bg-blue-100 text-blue-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    }
  };
};
