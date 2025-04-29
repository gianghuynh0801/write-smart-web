
import { useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { tokenManager } from "@/utils/tokenManager";
import { useAdminUsersDebounce } from "@/hooks/admin/useAdminUsersDebounce";
import { featureFlags } from "@/config/featureFlags";

interface UseAdminUsersEffectsProps {
  refreshUsers: () => Promise<void>;
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

  // Đã loại bỏ useEffect tự động tải dữ liệu khi component mount

  // Handler cập nhật sau khi user được lưu với thời gian delay dài hơn
  const handleUserActionComplete = useCallback(() => {
    console.log("[AdminUsers] Hoàn thành hành động người dùng, đang làm mới dữ liệu sau 3000ms...");
    setTimeout(() => {
      if (isMountedRef.current) {
        debouncedRefreshUsers(refreshUsers, true, isMountedRef);
      }
    }, 3000);
  }, [debouncedRefreshUsers, refreshUsers]);

  // Sử dụng biến cờ để đánh dấu đang refresh
  const isDataRefreshing = getIsDataRefreshing();

  const handleRefresh = useCallback(() => {
    console.log("[AdminUsers] Yêu cầu refresh thủ công");
    debouncedRefreshUsers(refreshUsers, true, isMountedRef);
  }, [debouncedRefreshUsers, refreshUsers]);

  return {
    isDataRefreshing,
    handleRefresh,
    handleUserActionComplete,
    isMountedRef,
  };
};
