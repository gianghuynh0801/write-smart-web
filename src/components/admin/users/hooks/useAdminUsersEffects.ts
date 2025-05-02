
import { useCallback, useRef, useState, useEffect } from "react";

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
  const safetyTimeoutRef = useRef<number | null>(null); // Thêm timeout an toàn
  const retryCountRef = useRef(0); // Đếm số lần thử lại
  const maxRetries = 3; // Số lần thử lại tối đa

  // Dọn dẹp tất cả các timeout khi unmount
  const clearAllTimeouts = useCallback(() => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
      refreshTimeoutRef.current = null;
    }
    
    if (processingStateTimeoutRef.current) {
      clearTimeout(processingStateTimeoutRef.current);
      processingStateTimeoutRef.current = null;
    }
    
    if (safetyTimeoutRef.current) {
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = null;
    }
  }, []);

  // Thêm effect để tự động reset trạng thái sau một khoảng thời gian nhất định
  useEffect(() => {
    if (isProcessingAction || isDataRefreshing) {
      // Tự động reset trạng thái sau 10 giây nếu không có thay đổi
      safetyTimeoutRef.current = window.setTimeout(() => {
        if (isMounted.current) {
          console.log("[useAdminUsersEffects] Tự động reset trạng thái sau thời gian chờ");
          setIsDataRefreshing(false);
          setIsProcessingAction(false);
          retryCountRef.current = 0;
        }
      }, 10000); // 10 giây là thời gian tối đa cho phép ở trạng thái xử lý
    }
    
    return () => {
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    };
  }, [isProcessingAction, isDataRefreshing]);
  
  // Hàm làm mới dữ liệu với debounce
  const handleRefresh = useCallback(async () => {
    if (isDataRefreshing) {
      console.log("[AdminUsersEffects] Đang làm mới dữ liệu, bỏ qua yêu cầu mới");
      return;
    }
    
    try {
      // Xóa timeout hiện tại nếu có
      clearAllTimeouts();
      
      setIsDataRefreshing(true);
      await refreshUsers(true); // Luôn sử dụng force refresh khi làm mới thủ công
      retryCountRef.current = 0; // Reset số lần thử lại nếu thành công
    } catch (error) {
      console.error("[AdminUsersEffects] Lỗi khi làm mới dữ liệu:", error);
      retryCountRef.current++;
    } finally {
      // Thêm chút độ trễ để tránh UI đóng băng
      refreshTimeoutRef.current = window.setTimeout(() => {
        if (isMounted.current) {
          setIsDataRefreshing(false);
        }
      }, 500);
    }
  }, [refreshUsers, isDataRefreshing, clearAllTimeouts]);

  // Xử lý sau khi hoàn thành các hành động như xóa, thêm tín dụng
  const handleUserActionComplete = useCallback(() => {
    // Ngăn chặn việc kích hoạt nhiều lần
    if (isProcessingAction) {
      console.log("[AdminUsersEffects] Đã có một hành động đang xử lý, bỏ qua");
      return;
    }
    
    setIsProcessingAction(true);
    
    // Xóa timeout nếu có
    if (processingStateTimeoutRef.current) {
      clearTimeout(processingStateTimeoutRef.current);
      processingStateTimeoutRef.current = null;
    }
    
    // Đợi một chút trước khi gọi refresh để tránh nhiều lần gọi API liên tiếp
    // và để giao diện có thời gian cập nhật
    processingStateTimeoutRef.current = window.setTimeout(async () => {
      try {
        await refreshUsers(true);
        retryCountRef.current = 0; // Reset số lần thử lại nếu thành công
      } catch (error) {
        console.error("[AdminUsersEffects] Lỗi khi làm mới dữ liệu sau hành động:", error);
        retryCountRef.current++;
        
        // Nếu vượt quá số lần thử lại, hiển thị thông báo cho người dùng
        if (retryCountRef.current >= maxRetries && isMounted.current) {
          console.log("[AdminUsersEffects] Đã đạt số lần thử lại tối đa");
          // Ở đây có thể thêm thông báo cho người dùng
        }
      } finally {
        if (isMounted.current) {
          setIsProcessingAction(false);
          handleUserSaved(); // Luôn gọi callback này để đảm bảo flow hoàn tất
        }
        
        processingStateTimeoutRef.current = null;
      }
    }, 800); // Tăng thời gian chờ để tránh đóng băng UI
  }, [refreshUsers, handleUserSaved, isProcessingAction]);
  
  // Cleanup function
  const cleanup = useCallback(() => {
    clearAllTimeouts();
    isMounted.current = false;
  }, [clearAllTimeouts]);

  return { 
    isDataRefreshing,
    isProcessingAction, 
    handleRefresh,
    handleUserActionComplete,
    cleanup,
    isMounted,
    retryCount: retryCountRef.current,
    maxRetries
  };
};
