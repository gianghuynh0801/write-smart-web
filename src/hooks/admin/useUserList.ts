
import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { authService, AuthErrorType, AuthError } from "@/services/authService";

// Hàm fetchUsers cải tiến với xử lý lỗi tốt hơn
const fetchUsers = async (params: {
  page: number;
  pageSize: number;
  status: string;
  searchTerm: string;
}) => {
  console.log("Đang lấy danh sách người dùng với các thông số:", params);

  try {
    // Lấy admin token từ AuthService
    const token = await authService.getAdminToken();
    if (!token) {
      throw new AuthError(
        "Không có phiên đăng nhập hợp lệ", 
        AuthErrorType.TOKEN_EXPIRED
      );
    }

    // Gọi edge function với token đã xác thực
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (error) {
      console.error("Lỗi khi gọi admin-users function:", error);
      
      // Kiểm tra lỗi xác thực và thử làm mới token
      if (authService.isAuthError(error)) {
        console.log("Phát hiện lỗi xác thực trong phản hồi, thử làm mới token...");
        const newToken = await authService.getAdminToken(true); // Force refresh
        
        if (newToken) {
          console.log("Đã làm mới token, thử gọi lại API...");
          const retryResponse = await supabase.functions.invoke('admin-users', {
            body: params,
            headers: {
              Authorization: `Bearer ${newToken}`
            }
          });
          
          if (retryResponse.error) {
            throw new Error(retryResponse.error.message);
          }
          
          return retryResponse.data.data;
        }
      }
      
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
    
    // Nếu là lỗi xác thực, thử làm mới token
    if (authService.isAuthError(error)) {
      await authService.handleAuthError(error);
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
  
  // Theo dõi trạng thái refreshing token
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  // Theo dõi component còn mounted hay không
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false; 
    };
  }, []);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: refreshUsers
  } = useQuery({
    queryKey: ['users', currentPage, pageSize, status, searchTerm],
    queryFn: () => fetchUsers({ page: currentPage, pageSize, status, searchTerm }),
    retry: (failureCount, error) => {
      // Thử lại tối đa 3 lần nếu là lỗi xác thực
      if (authService.isAuthError(error) && failureCount < 3) {
        console.log(`Thử lại lần ${failureCount + 1} sau lỗi xác thực`);
        return true;
      }
      return false;
    },
    meta: {
      onError: (err: Error) => {
        console.error("Lỗi khi tải danh sách người dùng:", err);
        
        if (isMounted.current) {
          // Hiển thị thông báo lỗi chi tiết hơn
          if (err instanceof AuthError) {
            switch (err.type) {
              case AuthErrorType.TOKEN_EXPIRED:
                toast({
                  title: "Phiên làm việc hết hạn",
                  description: "Vui lòng đăng nhập lại để tiếp tục.",
                  variant: "destructive"
                });
                break;
              case AuthErrorType.PERMISSION_DENIED:
                toast({
                  title: "Không có quyền truy cập",
                  description: "Bạn không có quyền thực hiện thao tác này.",
                  variant: "destructive"
                });
                break;
              default:
                toast({
                  title: "Lỗi xác thực",
                  description: err.message,
                  variant: "destructive"
                });
            }
          } else {
            toast({
              title: "Lỗi",
              description: err.message || "Không thể tải danh sách người dùng",
              variant: "destructive"
            });
          }
        }
      }
    }
  });

  // Effect để tự động thử làm mới token khi có lỗi
  useEffect(() => {
    if (isError && !isRefreshingToken) {
      console.log("Phát hiện lỗi, kiểm tra nếu là lỗi xác thực...");
      
      if (authService.isAuthError(error)) {
        if (isMounted.current) {
          setIsRefreshingToken(true);
          
          authService.getAdminToken(true)
            .then(token => {
              if (token && isMounted.current) {
                console.log("Đã làm mới token thành công, đang tải lại dữ liệu...");
                setTimeout(() => refreshUsers(), 500);
              } else if (isMounted.current) {
                console.log("Không thể làm mới token");
                toast({
                  title: "Lỗi xác thực",
                  description: "Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.",
                  variant: "destructive"
                });
              }
            })
            .finally(() => {
              if (isMounted.current) setIsRefreshingToken(false);
            });
        }
      }
    }
  }, [isError, error, refreshUsers, toast]);

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
