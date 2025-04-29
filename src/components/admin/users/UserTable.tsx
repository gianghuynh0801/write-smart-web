
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { User } from "@/types/user";
import { useRealtimeUsers } from "./hooks/useRealtimeUsers";
import { useRealtimeSubscriptions } from "./hooks/useRealtimeSubscriptions";
import { UserTableRow } from "./components/UserTableRow";
import { UserTableLoading } from "./components/UserTableLoading";
import { UserTableError } from "./components/UserTableError";
import { useMemo } from "react";

type UserTableProps = {
  users: User[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  isCreditUpdating?: boolean;
  getRoleColor: (role: string) => string;
  onEditUser: (userId: string | number) => void;
  onAddCredits: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onResendVerification?: (user: User) => void;
};

const UserTable = ({
  users,
  isLoading,
  isError = false,
  errorMessage = "",
  isCreditUpdating,
  getRoleColor,
  onEditUser,
  onAddCredits,
  onDeleteUser,
  onResendVerification,
}: UserTableProps) => {
  // Chỉ lấy danh sách ID thay vì toàn bộ đối tượng user để tránh re-render không cần thiết
  const userIds = useMemo(() => users.map(u => u.id), [users.map(u => u.id).join(',')]);
  
  const realtimeUserUpdates = useRealtimeUsers(userIds);
  const realtimeSubscriptionUpdates = useRealtimeSubscriptions(userIds);

  // Tính toán danh sách user với dữ liệu realtime
  const displayUsers = useMemo(() => {
    return users.map(user => {
      // Tạo một bản sao của user để không ảnh hưởng đến dữ liệu gốc
      const realtimeUser = { ...user };
      
      // Cập nhật từ realtimeUserUpdates (credits, status, role)
      if (realtimeUserUpdates[user.id]) {
        const updates = realtimeUserUpdates[user.id];
        if (updates.credits !== undefined) realtimeUser.credits = updates.credits;
        if (updates.status !== undefined) realtimeUser.status = updates.status;
        if (updates.role !== undefined) realtimeUser.role = updates.role;
      }
      
      // Cập nhật subscription từ realtimeSubscriptionUpdates
      if (realtimeSubscriptionUpdates[user.id]?.subscription) {
        realtimeUser.subscription = realtimeSubscriptionUpdates[user.id].subscription;
      }
      
      return realtimeUser;
    });
  }, [users, realtimeUserUpdates, realtimeSubscriptionUpdates]);

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Tên / Email</TableHead>
            <TableHead>Tín dụng</TableHead>
            <TableHead>Gói đăng ký</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Ngày đăng ký</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <UserTableLoading />
          ) : isError ? (
            <UserTableError errorMessage={errorMessage} />
          ) : displayUsers.length > 0 ? (
            displayUsers.map((user) => (
              <UserTableRow
                key={user.id}
                user={user}
                isCreditUpdating={isCreditUpdating}
                getRoleColor={getRoleColor}
                onEditUser={onEditUser}
                onAddCredits={onAddCredits}
                onDeleteUser={onDeleteUser}
                onResendVerification={onResendVerification}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                Không tìm thấy người dùng nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
