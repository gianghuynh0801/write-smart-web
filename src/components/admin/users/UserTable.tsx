
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from "lucide-react";
import { User } from "@/types/user";
import UserActions from "./UserActions";

type UserTableProps = {
  users: User[];
  isLoading: boolean;
  getRoleColor: (role: string) => string;
  onEditUser: (userId: string | number) => void;
  onAddCredits: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onResendVerification?: (user: User) => void;
};

const UserTable = ({
  users,
  isLoading,
  getRoleColor,
  onEditUser,
  onAddCredits,
  onDeleteUser,
  onResendVerification,
}: UserTableProps) => (
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
          <TableRow>
            <TableCell colSpan={7} className="h-24 text-center">
              <div className="flex justify-center">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            </TableCell>
          </TableRow>
        ) : users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>{user.credits}</TableCell>
              <TableCell>{user.subscription}</TableCell>
              <TableCell>
                <Badge variant={user.status === "active" ? "default" : "secondary"}>
                  {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </Badge>
              </TableCell>
              <TableCell>
                <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getRoleColor(user.role)}`}>
                  {user.role === "admin" ? "Quản trị viên" : 
                    user.role === "editor" ? "Biên tập viên" : "Người dùng"}
                </span>
              </TableCell>
              <TableCell>{new Date(user.registeredAt).toLocaleDateString("vi-VN")}</TableCell>
              <TableCell className="text-right">
                <UserActions
                  user={user}
                  onEditUser={onEditUser}
                  onAddCredits={onAddCredits}
                  onDeleteUser={onDeleteUser}
                  onResendVerification={onResendVerification}
                />
              </TableCell>
            </TableRow>
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

export default UserTable;
