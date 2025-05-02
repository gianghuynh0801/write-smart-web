
import { useCallback, useRef, useState } from "react";

interface UseAdminUsersEffectsProps {
  refreshUsers: (forceRefresh?: boolean) => Promise<boolean | void>;
  handleUserSaved: () => void;
}

export const useAdminUsersEffects = ({ 
  refreshUsers, 
  handleUserSaved 
}: UseAdminUsersEffectsProps) => {
  const [isDataRefreshing, setIsDataRefreshing] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const refreshTimeoutRef = useRef<number | null>(null);
  const isMounted = useRef(true);
  const processingStateTimeoutRef = useRef<number | null>(null);
  
  // Hàm làm mới dữ liệu với debounce
  const handleRefresh = useCallback(async () => {
    if (isDataRefreshing) return;
    
    try {
      // Xóa timeout hiện tại nếu có
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      setIsDataRefreshing(true);
      await refreshUsers(true); // Luôn sử dụng force refresh khi làm mới thủ công
    } catch (error) {
      console.error("[AdminUsersEffects] Lỗi khi làm mới dữ liệu:", error);
    } finally {
      // Thêm chút độ trễ để tránh UI đóng băng
      refreshTimeoutRef.current = window.setTimeout(() => {
        if (isMounted.current) {
          setIsDataRefreshing(false);
        }
      }, 500);
    }
  }, [refreshUsers, isDataRefreshing]);

  // Xử lý sau khi hoàn thành các hành động như xóa, thêm tín dụng
  const handleUserActionComplete = useCallback(() => {
    setIsProcessingAction(true);
    
    // Xóa timeout nếu có
    if (processingStateTimeoutRef.current) {
      clearTimeout(processingStateTimeoutRef.current);
    }
    
    // Đợi một chút trước khi gọi refresh để tránh nhiều lần gọi API liên tiếp
    processingStateTimeoutRef.current = window.setTimeout(async () => {
      try {
        await refreshUsers(true);
      } catch (error) {
        console.error("[AdminUsersEffects] Lỗi khi làm mới dữ liệu sau hành động:", error);
      } finally {
        if (isMounted.current) {
          setIsProcessingAction(false);
          handleUserSaved();
        }
      }
    }, 500);
  }, [refreshUsers, handleUserSaved]);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    if (processingStateTimeoutRef.current) {
      clearTimeout(processingStateTimeoutRef.current);
      processingStateTimeoutRef.current = null;
    }
  }, []);

  return { 
    isDataRefreshing,
    isProcessingAction, 
    handleRefresh,
    handleUserActionComplete,
    cleanup,
    isMounted
  };
};
