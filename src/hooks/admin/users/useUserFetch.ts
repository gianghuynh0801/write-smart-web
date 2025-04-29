
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
  checkRefreshThrottle: () => Promise<boolean>
) => {
  const { toast } = useToast();
  const isMounted = useRef(true);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
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

  // Tăng thời gian staleTime lên rất cao để tránh fetch tự động
  const staleTime = featureFlags.cacheValidTimeMs * 2; // Tăng gấp đôi thời gian từ featureFlags
  
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
        return await fetchUsers(
          { page: currentPage, pageSize, status, searchTerm },
          abortControllerRef.current.signal
        );
      } catch (error) {
        console.error("[useUserFetch] Lỗi khi fetch dữ liệu:", error);
        throw error;
      }
    },
    retry: 0, // Không tự động thử lại để tránh nhiều request
    staleTime: staleTime, // Tăng thời gian stale lên rất cao
    gcTime: staleTime * 2, // Giữ dữ liệu trong cache lâu hơn
    enabled: false, // Tắt tự động fetch khi mount để ngăn vòng lặp vô hạn
    meta: {
      onError: (err: Error) => {
        // Bỏ qua lỗi khi request bị hủy
        if (err.message === "Request bị hủy") {
          console.log("[useUserFetch] Request bị hủy, không hiển thị lỗi");
          return;
        }
        
        console.error("[useUserFetch] Lỗi khi tải danh sách người dùng:", err);
        
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
      // Kiểm tra giới hạn tần suất refresh - chỉ thực sự refresh khi cần
      const canRefresh = await checkRefreshThrottle();
      if (!canRefresh) {
        console.log("[useUserFetch] Đã từ chối yêu cầu refresh do hạn chế tần suất");
        // Trả về true trong trường hợp này để không hiển thị lỗi
        return true;
      }
      
      console.log("[useUserFetch] Bắt đầu làm mới danh sách người dùng");
      await refetch();
      return true;
    } catch (err) {
      console.error("[useUserFetch] Lỗi khi làm mới dữ liệu:", err);
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
              }
            })
            .finally(() => {
              if (isMounted.current) setIsRefreshingToken(false);
            });
        }, 5000); // Đợi 5 giây trước khi thử làm mới token
      }
    }
    
    return () => {
      clearTimeout(refreshTimer);
    };
  }, [isError, error]);

  return {
    data,
    isLoading,
    isError,
    error,
    refreshUsers,
    isMounted
  };
};
