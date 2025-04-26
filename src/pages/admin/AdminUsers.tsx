
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
    getRoleColor,
  } = useUserManagement();

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <div className="space-y-6">
      <AdminUsersHeader onAddUser={handleAddUser} />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                Tổng cộng {totalUsers} người dùng
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
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
            isCreditUpdating={isCreditUpdating}
            getRoleColor={getRoleColor}
            onEditUser={handleEditUser}
            onAddCredits={handleAddCredits}
            onDeleteUser={handleDeleteUser}
            onResendVerification={handleResendVerification}
          />
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Hiển thị {users.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} - {Math.min(currentPage * pageSize, totalUsers)} trên tổng số {totalUsers} người dùng
            </div>
            {totalPages > 0 && (
              <UserPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
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
        onUserSaved={loadUsers}
      />
    </div>
  );
};

export default AdminUsers;
