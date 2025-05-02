
import { useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { tokenManager } from "@/utils/tokenManager";
import { useAdminUsersDebounce } from "@/hooks/admin/useAdminUsersDebounce";
import { featureFlags } from "@/config/featureFlags";

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
    console.log("[AdminUsers] Hoàn thành hành động người dùng, đang làm mới dữ liệu sau 5000ms...");
    // Tăng thời gian delay lên 5 giây để đảm bảo các tác vụ nền đã hoàn tất
    setTimeout(() => {
      if (isMountedRef.current) {
        // Sử dụng force refresh để đảm bảo dữ liệu được làm mới hoàn toàn
        console.log("[AdminUsers] Đang làm mới dữ liệu với force=true sau khi hoàn thành hành động");
        refreshUsers(true);
      }
    }, 5000);
  }, [refreshUsers]);

  // Sử dụng biến cờ để đánh dấu đang refresh
  const isDataRefreshing = getIsDataRefreshing();

  const handleRefresh = useCallback(() => {
    console.log("[AdminUsers] Yêu cầu refresh thủ công");
    // Sử dụng force refresh khi refresh thủ công
    refreshUsers(true);
  }, [refreshUsers]);

  return {
    isDataRefreshing,
    handleRefresh,
    handleUserActionComplete,
    isMountedRef,
  };
};
