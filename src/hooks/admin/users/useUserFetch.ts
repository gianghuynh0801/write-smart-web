
import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/utils/api/userApiUtils";
import { useToast } from "@/hooks/use-toast";
import { isAuthError } from "@/services/authService";
import { tokenManager } from "@/utils/tokenManager";
import { featureFlags } from "@/config/featureFlags";

export const useUserFetch = (
  currentPage: number,
  pageSize: number,
  status: string,
  searchTerm: string,
  checkRefreshThrottle: (forceRefresh?: boolean) => Promise<boolean>
) => {
  const { toast } = useToast();
  const isMounted = useRef(true);
  const hasInitialFetch = useRef(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRefreshTimeRef = useRef<number>(0);
  const retryCountRef = useRef<number>(0);
  const maxRetries = 3;
  
  // Đảm bảo biến isMounted được set đúng khi component mount/unmount
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

  // Giữ caching để tối ưu hiệu năng nhưng giảm thời gian để hỗ trợ làm mới dễ dàng hơn
  const staleTime = featureFlags.cacheValidTimeMs / 2;
  
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
      
      try {
        // Đánh dấu đã thực hiện lần fetch đầu tiên
        hasInitialFetch.current = true;
        console.log("[useUserFetch] Đang fetch dữ liệu người dùng với params:", {
          page: currentPage, 
          pageSize, 
          status, 
          searchTerm
        });
        
        const result = await fetchUsers(
          { page: currentPage, pageSize, status, searchTerm },
          abortControllerRef.current.signal
        );
        
        console.log("[useUserFetch] Fetch thành công, nhận được:", {
          total: result.total,
          count: result.users?.length || 0
        });
        
        // Reset retry counter on success
        retryCountRef.current = 0;
        lastRefreshTimeRef.current = Date.now();
        return result;
      } catch (error) {
        console.error("[useUserFetch] Lỗi khi fetch dữ liệu:", error);
        throw error;
      }
    },
    retry: 1, // Tăng số lần thử lại lên 1 để tự động thử lại một lần
    staleTime, // Giảm thời gian stale để làm mới dữ liệu thường xuyên hơn
    gcTime: staleTime * 2, // Giữ dữ liệu trong cache lâu hơn
    enabled: true, // Cho phép tự động fetch khi mount, sẽ sử dụng cache nếu có
    meta: {
      onError: (err: Error) => {
        // Bỏ qua lỗi khi request bị hủy
        if (err.message === "Request bị hủy") {
          console.log("[useUserFetch] Request bị hủy, không hiển thị lỗi");
          return;
        }
        
        console.error("[useUserFetch] Lỗi khi tải danh sách người dùng:", err);
        
        if (isMounted.current) {
          // Hiển thị thông báo lỗi chi tiết hơn
          toast({
            title: "Lỗi khi tải dữ liệu",
            description: err.message || "Không thể tải danh sách người dùng. Vui lòng thử lại.",
            variant: "destructive"
          });
        }
      }
    }
  });

  // Tạo một phiên bản refetch có kiểm soát và hỗ trợ force refresh
  const refreshUsers = useCallback(async (forceRefresh = false) => {
    try {
      console.log("[useUserFetch] Đang yêu cầu refreshUsers, forceRefresh =", forceRefresh, 
        ", thời gian từ lần refresh trước:", 
        lastRefreshTimeRef.current ? Math.round((Date.now() - lastRefreshTimeRef.current) / 1000) + "s" : "chưa có refresh trước đó");
      
      // Nếu đang trong lần đầu tiên tải dữ liệu, bỏ qua kiểm tra hạn chế tần suất
      if (!hasInitialFetch.current) {
        console.log("[useUserFetch] Đang thực hiện tải dữ liệu lần đầu tiên");
        await refetch();
        return true;
      }
      
      // Kiểm tra giới hạn tần suất refresh khi đã có dữ liệu, truyền forceRefresh vào
      const canRefresh = await checkRefreshThrottle(forceRefresh);
      if (!canRefresh) {
        console.log("[useUserFetch] Đã từ chối yêu cầu refresh do hạn chế tần suất");
        // Trả về true trong trường hợp này để không hiển thị lỗi
        return true;
      }
      
      console.log("[useUserFetch] Bắt đầu làm mới danh sách người dùng");
      await refetch();
      lastRefreshTimeRef.current = Date.now();
      retryCountRef.current = 0; // Reset retry counter on successful refresh
      console.log("[useUserFetch] Làm mới danh sách người dùng thành công vào:", new Date(lastRefreshTimeRef.current).toLocaleTimeString());
      return true;
    } catch (err) {
      console.error("[useUserFetch] Lỗi khi làm mới dữ liệu:", err);
      
      // Thêm cơ chế retry với backoff tự động
      retryCountRef.current += 1;
      if (retryCountRef.current <= maxRetries) {
        const retryDelay = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 10000);
        console.log(`[useUserFetch] Thử lại lần ${retryCountRef.current}/${maxRetries} sau ${retryDelay/1000}s...`);
        
        // Thử làm mới token trước khi retry
        if (isAuthError(err)) {
          await tokenManager.refreshToken();
        }
        
        // Sử dụng setTimeout để tạo backoff delay
        return new Promise(resolve => {
          setTimeout(async () => {
            try {
              await refetch();
              lastRefreshTimeRef.current = Date.now();
              resolve(true);
            } catch (retryErr) {
              console.error(`[useUserFetch] Lỗi khi thử lại lần ${retryCountRef.current}:`, retryErr);
              resolve(false);
            }
          }, retryDelay);
        });
      }
      
      return false;
    }
  }, [refetch, checkRefreshThrottle]);

  // Effect để thử làm mới token khi có lỗi - đã giảm thiểu số lần gọi
  useEffect(() => {
    let refreshTimer: number;
    if (isError && !isRefreshingToken && isMounted.current) {
      // Chỉ làm mới token khi thực sự cần thiết
      if (isAuthError(error)) {
        setIsRefreshingToken(true);
        
        // Sử dụng setTimeout để hoãn việc refresh token, tránh lặp liên tục
        refreshTimer = window.setTimeout(() => {
          tokenManager.refreshToken()
            .then(token => {
              if (token && isMounted.current) {
                console.log("[useUserFetch] Đã làm mới token thành công");
                // Thử refetch dữ liệu sau khi làm mới token thành công
                setTimeout(() => {
                  if (isMounted.current) {
                    refreshUsers(true).catch(() => console.error("[useUserFetch] Không thể làm mới dữ liệu sau khi làm mới token"));
                  }
                }, 1000);
              }
            })
            .finally(() => {
              if (isMounted.current) setIsRefreshingToken(false);
            });
        }, 1000); // Giảm thời gian chờ xuống 1 giây để cải thiện UX
      }
    }
    
    return () => {
      clearTimeout(refreshTimer);
    };
  }, [isError, error, refreshUsers]);

  return {
    data,
    isLoading,
    isError,
    error,
    refreshUsers,
    isMounted,
    hasInitialFetch
  };
};
