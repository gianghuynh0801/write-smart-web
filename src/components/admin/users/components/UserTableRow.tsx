
import { User } from "@/types/user";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader } from "lucide-react";
import UserActions from "../UserActions";

interface UserTableRowProps {
  user: User;
  isCreditUpdating?: boolean;
  getRoleColor: (role: string) => string;
  onEditUser: (userId: string | number) => void;
  onAddCredits: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onResendVerification?: (user: User) => void;
}

export const UserTableRow = ({
  user,
  isCreditUpdating,
  getRoleColor,
  onEditUser,
  onAddCredits,
  onDeleteUser,
  onResendVerification
}: UserTableRowProps) => {
  return (
    <TableRow>
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
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{user.credits}</span>
          {isCreditUpdating && <Loader className="h-3 w-3 animate-spin text-primary" />}
        </div>
      </TableCell>
      <TableCell>{user.subscription || "Không có"}</TableCell>
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
  );
};
