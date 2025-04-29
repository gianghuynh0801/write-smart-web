
import { useCallback, useEffect } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import AdminUsersHeader from "@/components/admin/users/AdminUsersHeader";
import AdminUsersContent from "@/components/admin/users/AdminUsersContent";
import AdminUsersDialogs from "@/components/admin/users/AdminUsersDialogs";
import { useAdminUsersEffects } from "@/components/admin/users/hooks/useAdminUsersEffects";
import { useUserDialogHandlers } from "@/components/admin/users/hooks/useUserDialogHandlers";

const AdminUsers = () => {
  // Lấy tất cả state và handlers từ hook useUserManagement
  const {
    users,
    totalUsers,
    isLoading,
    isError,
    errorMessage,
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
    refreshUsers,
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
    getRoleColor,
  } = useUserManagement();

  // Handler cập nhật sau khi user được lưu 
  const handleUserSaved = useCallback(() => {
    console.log("[AdminUsers] Đã phát hiện người dùng được lưu, đang làm mới dữ liệu...");
  }, []);

  // Sử dụng effect hooks
  const { 
    isDataRefreshing, 
    handleRefresh,
    handleUserActionComplete
  } = useAdminUsersEffects({ 
    refreshUsers, 
    handleUserSaved 
  });

  // Sử dụng dialog handlers
  const {
    handleConfirmDeleteUser,
    handleConfirmAddCredits
  } = useUserDialogHandlers({
    confirmDeleteUser,
    confirmAddCredits,
    setDeleteDialogOpen,
    setAddCreditsDialogOpen,
    handleUserActionComplete
  });

  // Tính số trang
  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="space-y-6">
      <AdminUsersHeader onAddUser={handleAddUser} />

      <AdminUsersContent
        users={users}
        totalUsers={totalUsers}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        isCreditUpdating={isCreditUpdating}
        searchTerm={searchTerm}
        status={status}
        currentPage={currentPage}
        pageSize={pageSize}
        totalPages={totalPages}
        isDataRefreshing={isDataRefreshing}
        handleRefresh={handleRefresh}
        handleSearch={handleSearch}
        handleStatusChange={handleStatusChange}
        handlePageChange={handlePageChange}
        handleEditUser={handleEditUser}
        handleAddCredits={handleAddCredits}
        handleDeleteUser={handleDeleteUser}
        handleResendVerification={handleResendVerification}
        getRoleColor={getRoleColor}
      />

      <AdminUsersDialogs
        selectedUser={selectedUser}
        deleteDialogOpen={deleteDialogOpen}
        addCreditsDialogOpen={addCreditsDialogOpen}
        userDialogOpen={userDialogOpen}
        editUserId={editUserId}
        setDeleteDialogOpen={setDeleteDialogOpen}
        setAddCreditsDialogOpen={setAddCreditsDialogOpen}
        setUserDialogOpen={setUserDialogOpen}
        handleConfirmDeleteUser={handleConfirmDeleteUser}
        handleConfirmAddCredits={handleConfirmAddCredits}
        handleUserSaved={handleUserSaved}
      />
    </div>
  );
};

export default AdminUsers;
