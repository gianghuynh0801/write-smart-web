
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { ChangeEvent } from "react";

type UserFiltersProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
};

const UserFilters = ({
  searchTerm,
  onSearchChange,
  status,
  onStatusChange,
}: UserFiltersProps) => {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  return (
    <div className="flex flex-col md:flex-row items-center mb-4 gap-4">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          type="search"
          placeholder="Tìm kiếm người dùng..."
          className="pl-8"
          value={searchTerm}
          onChange={handleInputChange}
        />
      </div>
      <Tabs defaultValue={status} onValueChange={onStatusChange} value={status} className="w-full md:w-auto">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
          <TabsTrigger value="inactive">Không hoạt động</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
};

export default UserFilters;
