
import { useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { tokenManager } from "@/utils/tokenManager";
import { useAdminUsersDebounce } from "@/hooks/admin/useAdminUsersDebounce";

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

  // Chỉ tải dữ liệu khi component được mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("[AdminUsers] Đang khởi tạo dữ liệu...");
        // Đảm bảo có token admin hợp lệ trước khi tải dữ liệu
        const hasToken = await tokenManager.getToken();
        
        if (hasToken) {
          if (isMountedRef.current) {
            debouncedRefreshUsers(refreshUsers, false, isMountedRef);
          }
        } else if (isMountedRef.current) {
          toast({
            title: "Lỗi phiên đăng nhập",
            description: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
            variant: "destructive"
          });
        }
      } catch (error) {
        if (isMountedRef.current) {
          console.error("[AdminUsers] Lỗi khi tải dữ liệu ban đầu:", error);
        }
      }
    };
    
    loadData();
  }, [debouncedRefreshUsers, refreshUsers, toast]);

  // Handler cập nhật sau khi user được lưu với thời gian delay dài hơn
  const handleUserActionComplete = useCallback(() => {
    console.log("[AdminUsers] Hoàn thành hành động người dùng, đang làm mới dữ liệu sau 2000ms...");
    setTimeout(() => {
      if (isMountedRef.current) {
        debouncedRefreshUsers(refreshUsers, true, isMountedRef);
      }
    }, 2000);
  }, [debouncedRefreshUsers, refreshUsers]);

  // Sử dụng biến cờ để đánh dấu đang refresh
  const isDataRefreshing = getIsDataRefreshing();

  const handleRefresh = useCallback(() => {
    debouncedRefreshUsers(refreshUsers, true, isMountedRef);
  }, [debouncedRefreshUsers, refreshUsers]);

  return {
    isDataRefreshing,
    handleRefresh,
    handleUserActionComplete,
    isMountedRef,
  };
};
