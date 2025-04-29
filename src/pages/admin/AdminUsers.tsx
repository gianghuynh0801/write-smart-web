
import { useCallback, useEffect } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import AdminUsersHeader from "@/components/admin/users/AdminUsersHeader";
import AdminUsersContent from "@/components/admin/users/AdminUsersContent";
import AdminUsersDialogs from "@/components/admin/users/AdminUsersDialogs";
import { useAdminUsersEffects } from "@/components/admin/users/hooks/useAdminUsersEffects";
import { useUserDialogHandlers } from "@/components/admin/users/hooks/useUserDialogHandlers";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const { toast } = useToast();

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

  // Thêm hàm để load dữ liệu ban đầu khi trang được mở - chỉ gọi một lần khi component mount
  useEffect(() => {
    console.log("[AdminUsers] Trang đã được mở, cần làm mới dữ liệu thủ công");
    // KHÔNG tự động tải dữ liệu
  }, []);

  // Thêm một hàm để refresh dữ liệu thủ công với kiểm soát throttle
  const handleManualRefresh = useCallback(async () => {
    try {
      console.log("[AdminUsers] Đang làm mới dữ liệu thủ công...");
      await refreshUsers();
      toast({
        title: "Thành công",
        description: "Đã làm mới danh sách người dùng",
      });
    } catch (error) {
      console.error("[AdminUsers] Lỗi khi làm mới dữ liệu thủ công:", error);
      toast({
        title: "Lỗi",
        description: "Không thể làm mới danh sách người dùng",
        variant: "destructive"
      });
    }
  }, [refreshUsers, toast]);

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
        handleRefresh={handleManualRefresh}
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
