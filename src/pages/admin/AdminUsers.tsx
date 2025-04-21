
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Search, MoreHorizontal, Edit, Trash, UserPlus, Download, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Sample user data for the table
const users = [
  { 
    id: 1, 
    name: "Nguyễn Văn A", 
    email: "nguyenvana@example.com", 
    credits: 48, 
    subscription: "Chuyên nghiệp", 
    status: "active", 
    registeredAt: "2023-04-15" 
  },
  { 
    id: 2, 
    name: "Trần Thị B", 
    email: "tranthib@example.com", 
    credits: 22, 
    subscription: "Cơ bản", 
    status: "active", 
    registeredAt: "2023-03-28"
  },
  { 
    id: 3, 
    name: "Lê Văn C", 
    email: "levanc@example.com", 
    credits: 0, 
    subscription: "Không có", 
    status: "inactive", 
    registeredAt: "2023-02-10" 
  },
  { 
    id: 4, 
    name: "Phạm Thị D", 
    email: "phamthid@example.com", 
    credits: 89, 
    subscription: "Doanh nghiệp", 
    status: "active", 
    registeredAt: "2023-05-02" 
  },
  { 
    id: 5, 
    name: "Hoàng Văn E", 
    email: "hoangvane@example.com", 
    credits: 12, 
    subscription: "Cơ bản", 
    status: "active", 
    registeredAt: "2023-04-20" 
  },
];

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddCredits = (userId: number) => {
    toast({
      title: "Thêm tín dụng",
      description: `Đã thêm 10 tín dụng cho người dùng ID: ${userId}`
    });
  };
  
  const handleDeleteUser = (userId: number) => {
    toast({
      title: "Xóa người dùng",
      description: `Đã xóa người dùng ID: ${userId}`,
      variant: "destructive"
    });
  };
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
          <p className="text-gray-500">
            Quản lý thông tin và quyền của người dùng
          </p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Danh sách người dùng</CardTitle>
              <CardDescription>
                Tổng cộng {users.length} người dùng
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1 mr-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Tìm kiếm người dùng..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
            <Tabs defaultValue="all" className="w-auto">
              <TabsList>
                <TabsTrigger value="all">Tất cả</TabsTrigger>
                <TabsTrigger value="active">Đang hoạt động</TabsTrigger>
                <TabsTrigger value="inactive">Không hoạt động</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="rounded-md border">
            <div className="grid grid-cols-7 p-4 font-medium border-b bg-gray-50">
              <div className="col-span-2">Tên / Email</div>
              <div>Tín dụng</div>
              <div>Gói đăng ký</div>
              <div>Trạng thái</div>
              <div>Ngày đăng ký</div>
              <div className="text-right">Thao tác</div>
            </div>
            <div className="divide-y">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user.id} className="grid grid-cols-7 p-4 items-center">
                    <div className="col-span-2">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div>{user.credits}</div>
                    <div>{user.subscription}</div>
                    <div>
                      <Badge variant={user.status === "active" ? "default" : "secondary"}>
                        {user.status === "active" ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>
                    <div>{new Date(user.registeredAt).toLocaleDateString("vi-VN")}</div>
                    <div className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Mở menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAddCredits(user.id)}>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Thêm tín dụng
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600"
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Không tìm thấy người dùng nào
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Hiển thị 5 trên tổng số {users.length} người dùng
            </div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm">
                2
              </Button>
              <Button variant="outline" size="sm">
                Tiếp
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsers;
