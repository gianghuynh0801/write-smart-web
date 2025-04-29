
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "@/utils/api/userApiUtils";
import { useToast } from "@/hooks/use-toast";
import { isAuthError } from "@/services/authService";
import { tokenManager } from "@/utils/tokenManager";

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
      
      // Kiểm tra giới hạn tần suất refresh
      await checkRefreshThrottle();
      
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
  const refreshUsers = async () => {
    try {
      // Kiểm tra giới hạn tần suất refresh
      await checkRefreshThrottle();
      
      console.log("Bắt đầu làm mới danh sách người dùng");
      await refetch();
      return true;
    } catch (err) {
      console.error("Lỗi khi làm mới dữ liệu:", err);
      return false;
    }
  };

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

  return {
    data,
    isLoading,
    isError,
    error,
    refreshUsers,
    isMounted
  };
};
