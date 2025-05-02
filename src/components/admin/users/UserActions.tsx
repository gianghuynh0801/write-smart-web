
import { MoreHorizontal, Edit, PlusCircle, Trash, Send } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User } from "@/types/user";

interface UserActionsProps {
  user: User;
  onEditUser: (userId: string | number) => void;
  onAddCredits: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onResendVerification?: (user: User) => void;
  disabled?: boolean;
}

const UserActions = ({
  user,
  onEditUser,
  onAddCredits,
  onDeleteUser,
  onResendVerification,
  disabled = false
}: UserActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0" disabled={disabled}>
          <span className="sr-only">Mở menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Tác vụ</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onEditUser(user.id)} disabled={disabled}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddCredits(user)} disabled={disabled}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm tín dụng
        </DropdownMenuItem>
        {onResendVerification && (
          <DropdownMenuItem onClick={() => onResendVerification(user)} disabled={disabled}>
            <Send className="mr-2 h-4 w-4" />
            Gửi lại xác thực
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 focus:text-red-600" 
          onClick={() => onDeleteUser(user)}
          disabled={disabled}
        >
          <Trash className="mr-2 h-4 w-4" />
          Xóa người dùng
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;
