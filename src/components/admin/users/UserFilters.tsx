
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}

const UserFilters = ({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
  disabled = false
}: UserFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo tên hoặc email..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          disabled={disabled}
        />
      </div>
      <Select
        value={status}
        onValueChange={onStatusChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Trạng thái" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả</SelectItem>
          <SelectItem value="active">Kích hoạt</SelectItem>
          <SelectItem value="inactive">Tạm khóa</SelectItem>
          <SelectItem value="pending">Đang chờ</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default UserFilters;
