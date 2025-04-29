
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw } from "lucide-react";
import UserTable from "@/components/admin/users/UserTable";
import UserFilters from "@/components/admin/users/UserFilters";
import UserPagination from "@/components/admin/users/UserPagination";
import { User } from "@/types/user";

interface AdminUsersContentProps {
  users: User[];
  totalUsers: number;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  isCreditUpdating: boolean;
  searchTerm: string;
  status: string;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  isDataRefreshing: boolean;
  handleRefresh: () => void;
  handleSearch: (term: string) => void;
  handleStatusChange: (status: string) => void;
  handlePageChange: (page: number) => void;
  handleEditUser: (userId: string | number) => void;
  handleAddCredits: (user: User) => void;
  handleDeleteUser: (user: User) => void;
  handleResendVerification: (user: User) => void;
  getRoleColor: (role: string) => string;
}

const AdminUsersContent = ({
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
  totalPages,
  isDataRefreshing,
  handleRefresh,
  handleSearch,
  handleStatusChange,
  handlePageChange,
  handleEditUser,
  handleAddCredits,
  handleDeleteUser,
  handleResendVerification,
  getRoleColor,
}: AdminUsersContentProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Danh sách người dùng</CardTitle>
            <CardDescription>
              {!isError ? `Tổng cộng ${totalUsers} người dùng` : "Đang gặp lỗi khi tải dữ liệu"}
            </CardDescription>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={isLoading || isDataRefreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCcw className={`mr-2 h-4 w-4 ${(isLoading || isDataRefreshing) ? 'animate-spin' : ''}`} />
              {(isLoading || isDataRefreshing) ? 'Đang tải...' : 'Làm mới'}
            </Button>
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
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
          isLoading={isLoading || isDataRefreshing}
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-2">
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
  );
};

export default AdminUsersContent;
