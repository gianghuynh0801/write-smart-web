
import { useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { tokenManager } from "@/utils/tokenManager";
import { useAdminUsersDebounce } from "@/hooks/admin/useAdminUsersDebounce";
import { featureFlags } from "@/config/featureFlags";
import { clearAllUserCache } from "@/utils/api/userApiUtils";

interface UseAdminUsersEffectsProps {
  refreshUsers: (forceRefresh?: boolean) => Promise<void>;
  handleUserSaved: () => void;
}

export const useAdminUsersEffects = ({ 
  refreshUsers, 
  handleUserSaved 
}: UseAdminUsersEffectsProps) => {
  const isMountedRef = useRef(true);
  const { debouncedRefreshUsers, clearRefreshTimeout, getIsDataRefreshing } = useAdminUsersDebounce();
  const { toast } = useToast();
  const refreshAttemptsRef = useRef(0);
  const maxRefreshAttempts = 3;
  
  // Cleanup khi component unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => { 
      isMountedRef.current = false;
      clearRefreshTimeout();
    };
  }, [clearRefreshTimeout]);

  // Handler cập nhật sau khi user được lưu với thời gian delay dài hơn
  const handleUserActionComplete = useCallback(() => {
    console.log("[AdminUsers] Hoàn thành hành động người dùng, đang làm mới dữ liệu sau 2000ms...");
    refreshAttemptsRef.current = 0;
    
    // Xóa toàn bộ cache người dùng
    clearAllUserCache();
    
    // Thử làm mới dữ liệu với số lần thử tối đa
    const attemptRefresh = () => {
      if (refreshAttemptsRef.current >= maxRefreshAttempts) {
        console.log("[AdminUsers] Đã đạt số lần thử tối đa, tải lại trang...");
        window.location.reload();
        return;
      }
      
      refreshAttemptsRef.current++;
      
      setTimeout(() => {
        if (isMountedRef.current) {
          console.log(`[AdminUsers] Thử làm mới lần ${refreshAttemptsRef.current}/${maxRefreshAttempts}`);
          refreshUsers(true)
            .catch(() => {
              if (refreshAttemptsRef.current < maxRefreshAttempts) {
                attemptRefresh();
              } else {
                window.location.reload();
              }
            });
        }
      }, 1000);
    };
    
    attemptRefresh();
  }, [refreshUsers]);

  // Sử dụng biến cờ để đánh dấu đang refresh
  const isDataRefreshing = getIsDataRefreshing();

  const handleRefresh = useCallback(() => {
    console.log("[AdminUsers] Yêu cầu refresh thủ công");
    
    // Xóa toàn bộ cache người dùng
    clearAllUserCache();
    
    // Reset biến đếm số lần thử
    refreshAttemptsRef.current = 0;
    
    // Sử dụng force refresh khi refresh thủ công
    refreshUsers(true).catch(() => {
      toast({
        title: "Lỗi",
        description: "Không thể làm mới dữ liệu. Đang tải lại trang...",
        variant: "destructive"
      });
      
      // Nếu không thành công, tải lại trang
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    });
  }, [refreshUsers, toast]);

  return {
    isDataRefreshing,
    handleRefresh,
    handleUserActionComplete,
    isMountedRef,
  };
};
