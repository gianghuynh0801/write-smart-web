
import { useCallback, useEffect, useState, useRef } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { tokenManager } from "@/utils/tokenManager";

const AdminUsers = () => {
  const [isDataRefreshing, setIsDataRefreshing] = useState(false);
  const [refreshTimeout, setRefreshTimeout] = useState<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);
  
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

  // Cleanup khi component unmount
  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false;
      if (refreshTimeout) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [refreshTimeout]);

  // Tạo phiên bản debounced của hàm refreshUsers
  const debouncedRefreshUsers = useCallback((showToast = false, delay = 500) => {
    // Hủy timeout hiện tại nếu có
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      setRefreshTimeout(null);
    }
    
    if (isDataRefreshing) {
      console.log("[AdminUsers] Đang làm mới dữ liệu, bỏ qua yêu cầu mới");
      return;
    }
    
    setIsDataRefreshing(true);
    
    // Tạo timeout mới
    const timeoutId = setTimeout(async () => {
      try {
        console.log("[AdminUsers] Đang làm mới dữ liệu...");
        await refreshUsers();
        
        // Chỉ hiển thị toast khi được yêu cầu
        if (showToast && isMounted.current) {
          toast({
            title: "Đã làm mới dữ liệu",
            description: "Danh sách người dùng đã được cập nhật.",
          });
        }
      } catch (error) {
        console.error("[AdminUsers] Lỗi khi làm mới dữ liệu:", error);
        if (isMounted.current) {
          toast({
            title: "Lỗi làm mới dữ liệu",
            description: "Không thể làm mới danh sách người dùng. Vui lòng thử lại sau.",
            variant: "destructive"
          });
        }
      } finally {
        if (isMounted.current) {
          setIsDataRefreshing(false);
        }
      }
    }, delay);
    
    setRefreshTimeout(timeoutId);
  }, [refreshUsers, refreshTimeout, toast, isDataRefreshing]);

  // Chỉ tải dữ liệu khi component được mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[AdminUsers] Đang khởi tạo dữ liệu...");
        // Đảm bảo có token admin hợp lệ trước khi tải dữ liệu
        const hasToken = await tokenManager.getToken();
        
        if (hasToken) {
          if (isMounted.current) {
            debouncedRefreshUsers(false, 100);
          }
        } else {
          if (isMounted.current) {
            toast({
              title: "Lỗi phiên đăng nhập",
              description: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        if (isMounted.current) {
          console.error("[AdminUsers] Lỗi khi tải dữ liệu ban đầu:", error);
          toast({
            title: "Lỗi tải dữ liệu",
            description: "Không thể tải dữ liệu người dùng. Vui lòng thử lại sau.",
            variant: "destructive"
          });
        }
      }
    };
    
    loadData();
  }, [debouncedRefreshUsers, toast]);

  const totalPages = Math.ceil(totalUsers / pageSize);

  const handleRefresh = () => {
    debouncedRefreshUsers(true, 300);
  };

  // Handler cập nhật sau khi user được lưu
  const handleUserSaved = useCallback(() => {
    console.log("[AdminUsers] Đã phát hiện người dùng được lưu, đang làm mới dữ liệu sau 1000ms...");
    // Delay refresh để giao diện người dùng có thời gian cập nhật
    debouncedRefreshUsers(true, 1000);
  }, [debouncedRefreshUsers]);

  // Handler sau khi xóa hoặc cập nhật credits
  const handleUserActionComplete = useCallback(() => {
    console.log("[AdminUsers] Hoàn thành hành động người dùng, đang làm mới dữ liệu sau 800ms...");
    debouncedRefreshUsers(true, 800);
  }, [debouncedRefreshUsers]);

  // Xử lý xóa người dùng
  const handleConfirmDeleteUser = useCallback(async () => {
    try {
      await confirmDeleteUser();
      setDeleteDialogOpen(false);
      // Làm mới dữ liệu sau khi xóa
      handleUserActionComplete();
    } catch (error) {
      console.error("[AdminUsers] Lỗi khi xóa người dùng:", error);
      if (isMounted.current) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa người dùng. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      }
    }
  }, [confirmDeleteUser, setDeleteDialogOpen, handleUserActionComplete, toast]);

  // Xử lý thêm credits
  const handleConfirmAddCredits = useCallback(async (amount: number) => {
    try {
      await confirmAddCredits(amount);
      setAddCreditsDialogOpen(false);
      // Làm mới dữ liệu sau khi thêm credits
      handleUserActionComplete();
    } catch (error) {
      console.error("[AdminUsers] Lỗi khi thêm credits:", error);
      if (isMounted.current) {
        toast({
          title: "Lỗi",
          description: "Không thể thêm credits. Vui lòng thử lại sau.",
          variant: "destructive"
        });
      }
    }
  }, [confirmAddCredits, setAddCreditsDialogOpen, handleUserActionComplete, toast]);

  return (
    <div className="space-y-6">
      <AdminUsersHeader onAddUser={handleAddUser} />

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

      {selectedUser && (
        <>
          <DeleteUserDialog
            isOpen={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            onConfirm={handleConfirmDeleteUser}
            userName={selectedUser.name}
          />

          <AddCreditsDialog
            isOpen={addCreditsDialogOpen}
            onClose={() => setAddCreditsDialogOpen(false)}
            onConfirm={handleConfirmAddCredits}
            userName={selectedUser.name}
          />
        </>
      )}

      <UserDialog
        isOpen={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        userId={editUserId}
        onUserSaved={handleUserSaved}
      />
    </div>
  );
};

export default AdminUsers;
