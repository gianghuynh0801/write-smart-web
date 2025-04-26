
import { User } from "@/types/user";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Edit, CreditCard, Trash, MoreHorizontal, RefreshCw } from "lucide-react";

interface UserActionsProps {
  user: User;
  onEditUser: (userId: string | number) => void;
  onAddCredits: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onResendVerification?: (user: User) => void;
}

const UserActions = ({ 
  user,
  onEditUser,
  onAddCredits,
  onDeleteUser,
  onResendVerification,
}: UserActionsProps) => {
  // Show resend verification option only if user is not verified
  const showResendVerification = onResendVerification && user.email_verified === false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => onEditUser(user.id)}>
          <Edit className="mr-2 h-4 w-4" />
          Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onAddCredits(user)}>
          <CreditCard className="mr-2 h-4 w-4" />
          Thêm tín dụng
        </DropdownMenuItem>
        {showResendVerification && (
          <DropdownMenuItem onClick={() => onResendVerification(user)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Gửi lại xác thực
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDeleteUser(user)}
          className="text-red-600"
        >
          <Trash className="mr-2 h-4 w-4" />
          Xóa
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserActions;
