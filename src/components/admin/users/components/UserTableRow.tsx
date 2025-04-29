
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import UserBadge from "./UserBadge";
import UserStatusBadge from "./UserStatusBadge";
import UserActions from "../UserActions";
import { User } from "@/types/user";
import { formatDate } from "@/utils/formatDate";

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
  onResendVerification,
}: UserTableRowProps) => {
  // Format registration date
  const formattedDate = formatDate(user.registeredAt);

  // Get dynamic class for credit cell
  const getCreditCellClass = () => {
    if (isCreditUpdating) {
      return "animate-pulse bg-muted";
    }
    return "";
  };

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.name}</span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
      </TableCell>
      <TableCell className={getCreditCellClass()}>
        {user.credits}
      </TableCell>
      <TableCell>
        {user.subscription || "Không có"}
      </TableCell>
      <TableCell>
        <UserStatusBadge status={user.status} />
        {user.email_verified === false && (
          <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
            Chưa xác thực
          </span>
        )}
      </TableCell>
      <TableCell>
        <UserBadge role={user.role} color={getRoleColor(user.role)} />
      </TableCell>
      <TableCell className="text-muted-foreground text-sm">
        {formattedDate}
      </TableCell>
      <TableCell className="text-right">
        <UserActions
          user={user}
          onEditUser={onEditUser}
          onAddCredits={onAddCredits}
          onDeleteUser={onDeleteUser}
          onResendVerification={user.email_verified === false ? onResendVerification : undefined}
        />
      </TableCell>
    </TableRow>
  );
}
