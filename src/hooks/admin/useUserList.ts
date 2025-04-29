
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

// Cache cho kết quả API
interface UsersCache {
  data: {
    users: User[];
    total: number;
  };
  timestamp: number;
  params: {
    page: number;
    pageSize: number;
    status: string;
    searchTerm: string;
  };
}

// Tăng thời gian cache lên 5 phút
const cacheValidTime = 300000; // 5 phút
let usersCache: UsersCache | null = null;

// Hàm fetchUsers sửa đổi để chỉ lấy dữ liệu cần thiết cho bảng
const fetchUsers = async (params: {
  page: number;
  pageSize: number;
  status: string;
  searchTerm: string;
}, abortSignal?: AbortSignal) => {
  console.log("Đang lấy danh sách người dùng với các thông số:", params);

  // Kiểm tra cache trước
  const now = Date.now();
  if (usersCache && 
      now - usersCache.timestamp < cacheValidTime &&
      usersCache.params.page === params.page &&
      usersCache.params.pageSize === params.pageSize &&
      usersCache.params.status === params.status &&
      usersCache.params.searchTerm === params.searchTerm) {
    console.log("Sử dụng kết quả từ cache", {
      cacheAge: (now - usersCache.timestamp) / 1000,
      userCount: usersCache.data.users.length
    });
    return usersCache.data;
  }

  try {
    // Lấy admin token từ TokenManager
    const token = await tokenManager.getToken();
    if (!token) {
      throw new AuthError(
        "Không có phiên đăng nhập hợp lệ", 
        AuthErrorType.TOKEN_EXPIRED
      );
    }

    // Gọi Edge Function với tham số minimal=true để chỉ lấy dữ liệu tối thiểu
    const apiPromise = supabase.functions.invoke('admin-users', {
      body: {
        ...params,
        minimal: true  // Flag để Edge Function biết chỉ trả về dữ liệu tối thiểu
      },
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // Tạo timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      const id = setTimeout(() => {
        reject(new Error('Timeout khi lấy danh sách người dùng'));
      }, 15000); // 15 giây timeout để tránh đóng băng
      
      // Xóa timeout nếu có abort signal
      if (abortSignal) {
        abortSignal.addEventListener('abort', () => {
          clearTimeout(id);
          reject(new Error('Request bị hủy'));
        });
      }
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
            body: {
              ...params,
              minimal: true
            },
            headers: {
              Authorization: `Bearer ${newToken}`
            }
          });
          
          if (retryResponse.error) {
            throw new Error(retryResponse.error.message);
          }
          
          // Lưu vào cache
          usersCache = {
            data: retryResponse.data.data,
            timestamp: Date.now(),
            params: { ...params }
          };
          
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
    
    // Lưu vào cache
    usersCache = {
      data: data.data,
      timestamp: Date.now(),
      params: { ...params }
    };
    
    return data.data;
  } catch (error) {
    console.error("Lỗi trong fetchUsers:", error);
    
    if (abortSignal?.aborted) {
      console.log("Request bị hủy, không xử lý lỗi");
      throw new Error("Request bị hủy");
    }
    
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
  // Tăng khoảng thời gian tối thiểu giữa các lần refresh lên 5 giây
  const minRefreshInterval = 5000; // 5 giây giữa các lần refresh
  // Theo dõi request hiện tại
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMounted.current = true;
    return () => { 
      isMounted.current = false;
      // Hủy request đang chạy khi unmount
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Debounced search term setter với thời gian dài hơn
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      if (isMounted.current) {
        setSearchTerm(value);
        setCurrentPage(1);
      }
    }, 1000), // 1 giây để giảm số lượng request
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
    queryFn: async () => {
      // Hủy request trước đó nếu có
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Tạo controller mới
      abortControllerRef.current = new AbortController();
      
      // Kiểm tra thời gian giữa các lần refresh
      const now = Date.now();
      if (now - lastRefreshTime.current < minRefreshInterval) {
        console.log(`Hạn chế tần suất refresh: ${minRefreshInterval - (now - lastRefreshTime.current)}ms còn lại`);
        await new Promise(resolve => 
          setTimeout(resolve, minRefreshInterval - (now - lastRefreshTime.current))
        );
      }
      
      lastRefreshTime.current = Date.now();
      return fetchUsers(
        { page: currentPage, pageSize, status, searchTerm },
        abortControllerRef.current.signal
      );
    },
    retry: (failureCount, error) => {
      // Không retry nếu request bị hủy
      if (error.message === "Request bị hủy") {
        return false;
      }
      
      // Thử lại tối đa 1 lần nếu là lỗi xác thực
      if (isAuthError(error) && failureCount < 1) {
        console.log(`Thử lại lần ${failureCount + 1} sau lỗi xác thực`);
        return true;
      }
      return false;
    },
    staleTime: 60000, // Dữ liệu được coi là "tươi" trong 1 phút
    gcTime: 300000, // Giữ dữ liệu trong cache 5 phút
    meta: {
      onError: (err: Error) => {
        // Bỏ qua lỗi khi request bị hủy
        if (err.message === "Request bị hủy") {
          console.log("Request bị hủy, không hiển thị lỗi");
          return;
        }
        
        console.error("Lỗi khi tải danh sách người dùng:", err);
        
        if (isMounted.current) {
          // Hiển thị thông báo lỗi
          toast({
            title: "Lỗi",
            description: err.message || "Không thể tải danh sách người dùng",
            variant: "destructive"
          });
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
    if (isError && !isRefreshingToken && isMounted.current) {
      console.log("Phát hiện lỗi, kiểm tra nếu là lỗi xác thực...");
      
      if (isAuthError(error)) {
        setIsRefreshingToken(true);
        
        tokenManager.refreshToken()
          .then(token => {
            if (token && isMounted.current) {
              console.log("Đã làm mới token thành công, đang tải lại dữ liệu...");
              // Trì hoãn để tránh quá nhiều request
              setTimeout(() => {
                if (isMounted.current) {
                  refreshUsers();
                }
              }, 2000);
            }
          })
          .finally(() => {
            if (isMounted.current) setIsRefreshingToken(false);
          });
      }
    }
  }, [isError, error, refreshUsers]);

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

  // Xóa cache khi component unmount
  useEffect(() => {
    return () => {
      usersCache = null;
    };
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
