
import { useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { fetchUsers } from "@/api/userService";
import { User } from "@/types/user";

export const useUserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastUpdate, setLastUpdate] = useState(Date.now()); // Thêm state để theo dõi thời điểm cập nhật cuối
  const pageSize = 5;
  const { toast } = useToast();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage("");
    
    console.log("[useUserList] Đang tải danh sách người dùng...");
    try {
      const result = await fetchUsers(currentPage, pageSize, status, searchTerm);
      
      if (result.data.length === 0 && currentPage > 1) {
        setCurrentPage(1);
        return;
      }
      
      setUsers(result.data);
      setTotalUsers(result.total);
      console.log(`[useUserList] Đã tải ${result.data.length} người dùng, tổng số: ${result.total}`);
    } catch (error) {
      console.error("[useUserList] Lỗi khi tải danh sách người dùng:", error);
      setIsError(true);
      setErrorMessage(error instanceof Error ? error.message : "Không thể tải danh sách người dùng");
      setUsers([]);
      setTotalUsers(0);
      
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tải danh sách người dùng",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, status, searchTerm, toast]);

  const refreshUsers = useCallback(() => {
    console.log("[useUserList] Refresh danh sách người dùng");
    setLastUpdate(Date.now()); // Cập nhật thời điểm cập nhật cuối
  }, []);

  // Đảm bảo tải lại dữ liệu khi lastUpdate thay đổi
  useEffect(() => {
    loadUsers();
  }, [loadUsers, lastUpdate]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return {
    users,
    totalUsers,
    isLoading,
    isError,
    errorMessage,
    searchTerm,
    status,
    currentPage,
    pageSize,
    loadUsers,
    refreshUsers,
    handleSearch,
    handleStatusChange,
    handlePageChange,
  };
};
