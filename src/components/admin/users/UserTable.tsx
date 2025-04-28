
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader, AlertTriangle } from "lucide-react";
import { User } from "@/types/user";
import UserActions from "./UserActions";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type UserTableProps = {
  users: User[];
  isLoading: boolean;
  isError?: boolean;
  errorMessage?: string;
  isCreditUpdating?: boolean;
  getRoleColor: (role: string) => string;
  onEditUser: (userId: string | number) => void;
  onAddCredits: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onResendVerification?: (user: User) => void;
};

const UserTable = ({
  users,
  isLoading,
  isError = false,
  errorMessage = "",
  isCreditUpdating,
  getRoleColor,
  onEditUser,
  onAddCredits,
  onDeleteUser,
  onResendVerification,
}: UserTableProps) => {
  const [realtimeUsers, setRealtimeUsers] = useState<Record<string | number, User>>({});

  // Thiết lập theo dõi thời gian thực cho thay đổi của users
  useEffect(() => {
    console.log("[UserTable] Thiết lập theo dõi realtime cho người dùng");
    
    const channel = supabase
      .channel('user-credits-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          console.log("[UserTable] Nhận thay đổi realtime cho người dùng:", payload.new);
          // Cập nhật dữ liệu người dùng khi có thay đổi
          setRealtimeUsers(prev => ({
            ...prev,
            [payload.new.id]: {
              ...(users.find(u => u.id === payload.new.id) || {}),
              ...payload.new
            } as User
          }));
        }
      )
      .subscribe((status) => {
        console.log("[UserTable] Trạng thái đăng ký realtime:", status);
      });

    return () => {
      console.log("[UserTable] Hủy đăng ký realtime");
      supabase.removeChannel(channel);
    };
  }, [users]);

  // Kết hợp dữ liệu người dùng với cập nhật realtime
  const displayUsers = users.map(user => {
    // Nếu có dữ liệu thời gian thực cho người dùng này, sử dụng nó
    if (realtimeUsers[user.id]) {
      return {
        ...user,
        ...realtimeUsers[user.id]
      };
    }
    return user;
  });

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Tên / Email</TableHead>
            <TableHead>Tín dụng</TableHead>
            <TableHead>Gói đăng ký</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Vai trò</TableHead>
            <TableHead>Ngày đăng ký</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex justify-center">
                  <Loader className="h-6 w-6 animate-spin text-primary" />
                </div>
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <div className="flex flex-col items-center gap-2 text-red-500">
                  <AlertTriangle className="h-8 w-8" />
                  <div className="font-medium">Có lỗi xảy ra</div>
                  <div className="text-sm">{errorMessage || "Không thể tải dữ liệu người dùng"}</div>
                </div>
              </TableCell>
            </TableRow>
          ) : displayUsers.length > 0 ? (
            displayUsers.map((user) => (
              <TableRow key={user.id}>
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
                    {isCreditUpdating && user.id === displayUsers.find(u => u.id === user.id)?.id && (
                      <Loader className="h-3 w-3 animate-spin text-primary" />
                    )}
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                Không tìm thấy người dùng nào
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
