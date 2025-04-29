
import { useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

export const useAdminUsersDebounce = () => {
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDataRefreshingRef = useRef(false);
  const { toast } = useToast();

  // Tạo phiên bản debounced của hàm refreshUsers với thời gian dài hơn
  const debouncedRefreshUsers = useCallback((
    refreshUsers: () => Promise<void>,
    showToast = false,
    isMountedRef: React.MutableRefObject<boolean>
  ) => {
    // Hủy timeout hiện tại nếu có
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    if (isDataRefreshingRef.current) {
      console.log("[AdminUsers] Đang làm mới dữ liệu, bỏ qua yêu cầu mới");
      return;
    }
    
    isDataRefreshingRef.current = true;
    
    // Tạo timeout mới với thời gian dài hơn
    const timeoutId = setTimeout(async () => {
      try {
        console.log("[AdminUsers] Đang làm mới dữ liệu...");
        await refreshUsers();
        
        // Chỉ hiển thị toast khi được yêu cầu
        if (showToast && isMountedRef.current) {
          toast({
            title: "Đã làm mới dữ liệu",
            description: "Danh sách người dùng đã được cập nhật.",
          });
        }
      } catch (error) {
        console.error("[AdminUsers] Lỗi khi làm mới dữ liệu:", error);
      } finally {
        if (isMountedRef.current) {
          isDataRefreshingRef.current = false;
        }
      }
    }, 2000); // 2000ms để giảm số lượng request
    
    refreshTimeoutRef.current = timeoutId;
  }, [toast]);

  const getIsDataRefreshing = () => isDataRefreshingRef.current;
  
  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
  };

  return {
    debouncedRefreshUsers,
    getIsDataRefreshing,
    clearRefreshTimeout,
  };
};
