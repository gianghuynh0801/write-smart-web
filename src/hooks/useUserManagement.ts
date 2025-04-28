
import { useEffect } from "react";
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
    refreshUsers,
    handleSearch,
    handleStatusChange,
    handlePageChange,
  } = useUserList();

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

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

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
