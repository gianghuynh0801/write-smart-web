
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

interface AdminUsersHeaderProps {
  onAddUser: () => void;
}

const AdminUsersHeader = ({ onAddUser }: AdminUsersHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <p className="text-gray-500">
          Quản lý thông tin và quyền của người dùng
        </p>
      </div>
      <Button onClick={onAddUser}>
        <UserPlus className="mr-2 h-4 w-4" />
        Thêm người dùng
      </Button>
    </div>
  );
};

export default AdminUsersHeader;
