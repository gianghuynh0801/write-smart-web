
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

type UserFiltersProps = {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  status: string;
  onStatusChange: (value: string) => void;
};

const UserFilters = ({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
}: UserFiltersProps) => (
  <div className="flex items-center mb-4">
    <div className="relative flex-1 mr-4">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
      <Input
        type="search"
        placeholder="Tìm kiếm người dùng..."
        className="pl-8"
        value={searchTerm}
        onChange={onSearchChange}
      />
    </div>
    <Tabs defaultValue={status} onValueChange={onStatusChange} className="w-auto">
      <TabsList>
        <TabsTrigger value="all">Tất cả</TabsTrigger>
        <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
        <TabsTrigger value="inactive">Không hoạt động</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
);

export default UserFilters;
