
import { useState, useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/user";
import { useToast } from "@/hooks/use-toast";
import { authService, AuthErrorType, AuthError, isAuthError } from "@/services/authService";
import { tokenManager } from "@/utils/tokenManager";

// Thêm debounce helper function
function debounce<F extends (...args: any[]) => any>(func: F, wait: number) {
  let timeout: NodeJS.Timeout | null = null;
  
  return function(this: any, ...args: Parameters<F>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func.apply(this, args);
      timeout = null;
    }, wait);
  };
}

// Hàm fetchUsers cải tiến với xử lý lỗi tốt hơn và timeout
const fetchUsers = async (params: {
  page: number;
  pageSize: number;
  status: string;
  searchTerm: string;
}) => {
  console.log("Đang lấy danh sách người dùng với các thông số:", params);

  try {
    // Lấy admin token từ TokenManager
    const token = await tokenManager.getToken();
    if (!token) {
      throw new AuthError(
        "Không có phiên đăng nhập hợp lệ", 
        AuthErrorType.TOKEN_EXPIRED
      );
    }

    // Tạo promise cho API call
    const apiPromise = supabase.functions.invoke('admin-users', {
      body: params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Tạo timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout khi lấy danh sách người dùng'));
      }, 15000); // 15 giây timeout
    });
    
    // Sử dụng Promise.race để áp dụng timeout
    const { data, error } = await Promise.race([
      apiPromise,
      timeoutPromise
    ]) as any;

    if (error) {
      console.error("Lỗi khi gọi admin-users function:", error);
      
      // Kiểm tra lỗi xác thực và thử làm mới token
      if (isAuthError(error)) {
        console.log("Phát hiện lỗi xác thực trong phản hồi, thử làm mới token...");
        const newToken = await tokenManager.refreshToken();
        
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
    if (isAuthError(error)) {
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
  // Theo dõi thời gian refresh cuối cùng để tránh refresh quá nhanh
  const lastRefreshTime = useRef(0);
  const minRefreshInterval = 1000; // 1 giây giữa các lần refresh

  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false; 
    };
  }, []);

  // Debounced search term setter
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      if (isMounted.current) {
        setSearchTerm(value);
        setCurrentPage(1);
      }
    }, 500),
    []
  );

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['users', currentPage, pageSize, status, searchTerm],
    queryFn: () => {
      // Kiểm tra thời gian giữa các lần refresh
      const now = Date.now();
      if (now - lastRefreshTime.current < minRefreshInterval) {
        console.log(`Hạn chế tần suất refresh: ${minRefreshInterval - (now - lastRefreshTime.current)}ms còn lại`);
        return new Promise(resolve => {
          setTimeout(() => {
            lastRefreshTime.current = Date.now();
            resolve(fetchUsers({ page: currentPage, pageSize, status, searchTerm }));
          }, minRefreshInterval);
        });
      }
      
      lastRefreshTime.current = now;
      return fetchUsers({ page: currentPage, pageSize, status, searchTerm });
    },
    retry: (failureCount, error) => {
      // Thử lại tối đa 3 lần nếu là lỗi xác thực
      if (isAuthError(error) && failureCount < 3) {
        console.log(`Thử lại lần ${failureCount + 1} sau lỗi xác thực`);
        return true;
      }
      return false;
    },
    staleTime: 30000, // Dữ liệu được coi là "tươi" trong 30 giây
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

  // Tạo một phiên bản refetch có kiểm soát
  const refreshUsers = useCallback(async () => {
    try {
      // Kiểm tra thời gian giữa các lần refresh
      const now = Date.now();
      if (now - lastRefreshTime.current < minRefreshInterval) {
        console.log(`Refresh bị hạn chế: Chờ ${minRefreshInterval - (now - lastRefreshTime.current)}ms`);
        await new Promise(resolve => setTimeout(resolve, minRefreshInterval - (now - lastRefreshTime.current)));
      }
      
      lastRefreshTime.current = Date.now();
      console.log("Bắt đầu làm mới danh sách người dùng");
      
      await refetch();
      return true;
    } catch (err) {
      console.error("Lỗi khi làm mới dữ liệu:", err);
      return false;
    }
  }, [refetch]);

  // Effect để tự động thử làm mới token khi có lỗi
  useEffect(() => {
    if (isError && !isRefreshingToken) {
      console.log("Phát hiện lỗi, kiểm tra nếu là lỗi xác thực...");
      
      if (isAuthError(error)) {
        if (isMounted.current) {
          setIsRefreshingToken(true);
          
          tokenManager.refreshToken()
            .then(token => {
              if (token && isMounted.current) {
                console.log("Đã làm mới token thành công, đang tải lại dữ liệu...");
                setTimeout(() => {
                  if (isMounted.current) {
                    refreshUsers();
                  }
                }, 500);
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
    debouncedSetSearchTerm(value);
  }, [debouncedSetSearchTerm]);

  const handleStatusChange = useCallback((value: string) => {
    if (isMounted.current) {
      setStatus(value);
      setCurrentPage(1);
    }
  }, []);

  const handlePageChange = useCallback((page: number) => {
    if (isMounted.current) {
      setCurrentPage(page);
    }
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
