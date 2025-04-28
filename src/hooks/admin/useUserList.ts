
import { useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { refreshSessionToken } from "@/api/user/userMutations";

const fetchUsers = async (params: {
  page: number;
  pageSize: number;
  status: string;
  searchTerm: string;
}) => {
  console.log("Đang lấy danh sách người dùng với các thông số:", params);

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.access_token) {
      throw new Error("Không có phiên đăng nhập hợp lệ");
    }

    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: params,
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (error) {
      console.error("Lỗi khi gọi admin-users function:", error);
      throw error;
    }

    if (data.error) {
      console.error("admin-users function trả về lỗi:", data.error);
      throw new Error(data.error);
    }

    console.log(`Đã lấy được ${data.data.users.length} người dùng, tổng số: ${data.data.total}`);
    return data.data;
  } catch (error) {
    console.error("Lỗi trong fetchUsers:", error);
    
    // Thử làm mới token nếu có dấu hiệu là lỗi xác thực
    if (error instanceof Error && 
        (error.message.includes("xác thực") || 
         error.message.includes("authentication") ||
         error.message.includes("jwt") ||
         error.message.includes("token") ||
         error.message.includes("auth"))) {
      
      console.log("Có thể là lỗi xác thực, thử làm mới token...");
      await refreshSessionToken();
    }
    
    throw error;
  }
};

export const useUserList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { toast } = useToast();
  
  // Thêm state để theo dõi trạng thái refreshing token
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refreshUsers
  } = useQuery({
    queryKey: ['users', currentPage, pageSize, status, searchTerm],
    queryFn: () => fetchUsers({ page: currentPage, pageSize, status, searchTerm }),
    retry: 2,
    meta: {
      onError: (err: Error) => {
        console.error("Lỗi khi tải danh sách người dùng:", err);
        toast({
          title: "Lỗi",
          description: err instanceof Error ? err.message : "Không thể tải danh sách người dùng",
          variant: "destructive"
        });
      }
    }
  });

  // Thêm một effect để tự động thử làm mới token khi có lỗi
  useEffect(() => {
    if (isError && !isRefreshingToken) {
      const errorMessage = error instanceof Error ? error.message : "Lỗi không xác định";
      const isAuthError = 
        errorMessage.includes("xác thực") || 
        errorMessage.includes("authentication") ||
        errorMessage.includes("jwt") || 
        errorMessage.includes("token") ||
        errorMessage.includes("auth");
      
      if (isAuthError) {
        console.log("Phát hiện lỗi xác thực, đang thử làm mới token...");
        setIsRefreshingToken(true);
        
        // Thử làm mới token và thử lại
        refreshSessionToken()
          .then(newToken => {
            if (newToken) {
              console.log("Đã làm mới token thành công, đang tải lại dữ liệu...");
              setTimeout(() => refreshUsers(), 500);
            } else {
              console.log("Không thể làm mới token");
            }
          })
          .finally(() => {
            if (isMounted) setIsRefreshingToken(false);
          });
      }
    }
    
    // Sử dụng biến để theo dõi component có còn mounted hay không
    let isMounted = true;
    return () => { isMounted = false; };
  }, [isError, error, refreshUsers]);

  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  return {
    users: (data?.users ?? []) as User[],
    totalUsers: data?.total ?? 0,
    isLoading,
    isError,
    errorMessage: error instanceof Error ? error.message : "Lỗi không xác định",
    searchTerm,
    status,
    currentPage,
    pageSize,
    refreshUsers,
    handleSearch,
    handleStatusChange,
    handlePageChange,
  };
};
