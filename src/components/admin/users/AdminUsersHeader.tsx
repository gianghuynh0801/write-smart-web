
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface AdminUsersHeaderProps {
  onAddUser: () => void;
  disabled?: boolean;
}

const AdminUsersHeader = ({ onAddUser, disabled = false }: AdminUsersHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h2>
        <p className="text-muted-foreground">
          Quản lý thông tin, quyền hạn và tín dụng của người dùng.
        </p>
      </div>
      <Button onClick={onAddUser} disabled={disabled}>
        <UserPlus className="mr-2 h-4 w-4" />
        Thêm người dùng
      </Button>
    </div>
  );
};

export default AdminUsersHeader;
