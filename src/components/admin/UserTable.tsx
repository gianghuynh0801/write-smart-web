
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { User } from "@/types/user";
import { UserTableRow } from "./users/components/UserTableRow";
import { UserTableLoading } from "./users/components/UserTableLoading";
import { UserTableError } from "./users/components/UserTableError";

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
          ) : users.length > 0 ? (
            users.map((user) => (
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
