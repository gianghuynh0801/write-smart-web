
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw } from "lucide-react";
import DeleteUserDialog from "@/components/admin/DeleteUserDialog";
import AddCreditsDialog from "@/components/admin/AddCreditsDialog";
import UserDialog from "@/components/admin/UserDialog";
import UserTable from "@/components/admin/users/UserTable";
import UserFilters from "@/components/admin/users/UserFilters";
import UserPagination from "@/components/admin/users/UserPagination";
import AdminUsersHeader from "@/components/admin/users/AdminUsersHeader";
import { useUserManagement } from "@/hooks/useUserManagement";

const AdminUsers = () => {
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

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  const totalPages = Math.ceil(totalUsers / pageSize);

  const handleRefresh = () => {
    console.log("[AdminUsers] Đang làm mới dữ liệu...");
    refreshUsers();
  };

  return (
    <div className="space-y-6">
      <AdminUsersHeader onAddUser={handleAddUser} />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                {!isError ? `Tổng cộng ${totalUsers} người dùng` : "Đang gặp lỗi khi tải dữ liệu"}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Xuất CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <UserFilters
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            status={status}
            onStatusChange={handleStatusChange}
          />
          <UserTable
            users={users}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            isCreditUpdating={isCreditUpdating}
            getRoleColor={getRoleColor}
            onEditUser={handleEditUser}
            onAddCredits={handleAddCredits}
            onDeleteUser={handleDeleteUser}
            onResendVerification={handleResendVerification}
          />
          {!isError && totalPages > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Hiển thị {users.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalUsers)} trên tổng số {totalUsers} người dùng
              </div>
              <UserPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <DeleteUserDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={confirmDeleteUser}
            userName={selectedUser.name}
          />

          <AddCreditsDialog
            isOpen={addCreditsDialogOpen}
            onClose={() => setAddCreditsDialogOpen(false)}
            onConfirm={confirmAddCredits}
            userName={selectedUser.name}
          />
        </>
      )}

      <UserDialog
        isOpen={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        userId={editUserId}
        onUserSaved={refreshUsers}
      />
    </div>
  );
};

export default AdminUsers;
