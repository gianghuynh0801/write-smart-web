
import { useCallback, useEffect, useRef } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import AdminUsersHeader from "@/components/admin/users/AdminUsersHeader";
import AdminUsersContent from "@/components/admin/users/AdminUsersContent";
import AdminUsersDialogs from "@/components/admin/users/AdminUsersDialogs";
import { useAdminUsersEffects } from "@/components/admin/users/hooks/useAdminUsersEffects";
import { useUserDialogHandlers } from "@/components/admin/users/hooks/useUserDialogHandlers";
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
  const errorCountRef = useRef(0);
  const maxErrorCount = 3;

  // Handler cập nhật sau khi user được lưu 
  const handleUserSaved = useCallback(() => {
    console.log("[AdminUsers] Đã phát hiện người dùng được lưu, đang làm mới dữ liệu...");
    // Sử dụng force refresh để đảm bảo dữ liệu mới nhất
    refreshUsers(true).catch(() => {
      errorCountRef.current++;
      if (errorCountRef.current >= maxErrorCount) {
        console.log("[AdminUsers] Đã đạt số lỗi tối đa, tải lại trang...");
        window.location.reload();
      }
    });
  }, [refreshUsers]);

  // Sử dụng effect hooks - đã cải thiện để hỗ trợ trạng thái xử lý
  const { 
    isDataRefreshing, 
    isProcessingAction,
    handleRefresh,
    handleUserActionComplete,
    cleanup,
    isMounted
  } = useAdminUsersEffects({ 
    refreshUsers, 
    handleUserSaved 
  });

  // Sử dụng dialog handlers với cả isProcessing
  const {
    handleConfirmDeleteUser,
    handleConfirmAddCredits,
    isProcessing
  } = useUserDialogHandlers({
    confirmDeleteUser,
    confirmAddCredits,
    setDeleteDialogOpen,
    setAddCreditsDialogOpen,
    handleUserActionComplete
  });

  // Thêm hàm để load dữ liệu ban đầu khi trang được mở - tự động tải dữ liệu khi component mount
  useEffect(() => {
    console.log("[AdminUsers] Trang đã được mở, tự động tải dữ liệu ban đầu");
    
    refreshUsers(false).catch(() => {
      errorCountRef.current++;
      if (errorCountRef.current >= maxErrorCount) {
        console.log("[AdminUsers] Lỗi khi tải dữ liệu ban đầu, tải lại trang...");
        window.location.reload();
      }
    });
    
    return () => {
      isMounted.current = false;
      cleanup();
    };
  }, [refreshUsers, cleanup]);

  // Thêm một hàm để refresh dữ liệu thủ công với kiểm soát
  const handleManualRefresh = useCallback(async () => {
    if (isDataRefreshing || isProcessingAction) return;
    
    try {
      console.log("[AdminUsers] Đang làm mới dữ liệu thủ công...");
      errorCountRef.current = 0;
      await handleRefresh();
      
      toast({
        title: "Thành công",
        description: "Đã làm mới danh sách người dùng",
      });
    } catch (error) {
      console.error("[AdminUsers] Lỗi khi làm mới dữ liệu thủ công:", error);
      errorCountRef.current++;
      
      toast({
        title: "Lỗi",
        description: "Không thể làm mới danh sách người dùng",
        variant: "destructive"
      });
      
      if (errorCountRef.current >= maxErrorCount) {
        console.log("[AdminUsers] Đã đạt số lỗi tối đa, tải lại trang...");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    }
  }, [handleRefresh, toast, isDataRefreshing, isProcessingAction]);

  // Tính số trang
  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="space-y-6">
      <AdminUsersHeader 
        onAddUser={handleAddUser} 
        disabled={isProcessingAction || isDataRefreshing || isProcessing}
      />

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
        isProcessingAction={isProcessingAction || isProcessing}
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
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default AdminUsers;
