
import { useUserList } from "./admin/useUserList";
import { useUserActions } from "./admin/useUserActions";
import { useUserStyles } from "./admin/useUserStyles";

export const useUserManagement = () => {
  const {
    users,
    totalUsers,
    isLoading,
    isError,
    errorMessage,
    searchTerm,
    status,
    currentPage,
    pageSize,
    refreshUsers: rawRefreshUsers,
    handleSearch,
    handleStatusChange,
    handlePageChange,
  } = useUserList();

  // Bọc refreshUsers để đảm bảo tương thích kiểu dữ liệu và cho phép force refresh
  const refreshUsers = async (forceRefresh = false) => {
    try {
      console.log("[useUserManagement] Đang làm mới danh sách người dùng, forceRefresh =", forceRefresh);
      await rawRefreshUsers(forceRefresh);
    } catch (error) {
      console.error("[useUserManagement] Lỗi khi làm mới danh sách người dùng:", error);
    }
  };

  const {
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
  } = useUserActions(refreshUsers);

  const { getRoleColor } = useUserStyles();

  return {
    // User list state and handlers
    users,
    totalUsers,
    isLoading,
    isError,
    errorMessage,
    searchTerm,
    status,
    currentPage,
    pageSize,
    refreshUsers,
    handleSearch,
    handleStatusChange,
    handlePageChange,

    // User actions state and handlers
    isCreditUpdating,
    selectedUser,
    deleteDialogOpen,
    addCreditsDialogOpen,
    userDialogOpen,
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
    setUserDialogOpen,

    // Styles
    getRoleColor,
  };
};
