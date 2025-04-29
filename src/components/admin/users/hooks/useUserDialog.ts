
import { useState, useRef, useCallback, useEffect } from "react";
import { User } from "@/types/user";
import { getUserById } from "@/api/user/userCrud";
import { useToast } from "@/hooks/use-toast";

export const useUserDialog = (
  userId: string | number | undefined,
  isOpen: boolean,
  onClose: () => void
) => {
  const [user, setUser] = useState<User | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);
  const retryCount = useRef(0);
  const maxRetries = 1; // Giảm số lần retry xuống
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Đảm bảo các biến tham chiếu được reset khi component unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Reset state khi dialog đóng
  useEffect(() => {
    if (!isOpen) {
      // Đảm bảo hủy các request đang chạy khi dialog đóng
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    }
  }, [isOpen]);

  const resetDialog = useCallback(() => {
    if (isMounted.current) {
      setUser(undefined);
      setError(null);
      retryCount.current = 0;
      setIsSubmitting(false);
    }
    
    // Hủy các request đang chạy khi reset
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const handleError = useCallback((errorMessage: string, shouldRetry = true) => {
    if (!isMounted.current) return;
    
    setError(errorMessage);
    
    if (shouldRetry && retryCount.current < maxRetries) {
      retryCount.current += 1;
      console.log(`[useUserDialog] Đang thử lại lần ${retryCount.current}/${maxRetries}...`);
      
      // Đặt thời gian thử lại ngắn hơn
      setTimeout(() => {
        if (isMounted.current) {
          fetchUser(true);
        }
      }, 1000);
    } else if (retryCount.current >= maxRetries && isMounted.current) {
      toast({
        title: "Lỗi",
        description: `${errorMessage}. Đã thử lại ${maxRetries} lần không thành công.`,
        variant: "destructive"
      });
    }
  }, [maxRetries, toast]);

  const fetchUser = useCallback(async (shouldRetry = true) => {
    // Không fetch nếu dialog đóng hoặc không có userId
    if (!userId || !isOpen) {
      if (isMounted.current) {
        resetDialog();
      }
      return;
    }
    
    // Hủy request trước đó nếu có
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Tạo controller mới cho request hiện tại
    abortControllerRef.current = new AbortController();
    
    if (isMounted.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      // Gọi API để lấy thông tin chi tiết của user
      const userData = await getUserById(userId);
      
      if (!isMounted.current) return;
      
      console.log("[useUserDialog] Đã lấy được thông tin user:", userData);
      setUser(userData);
      setError(null);
      retryCount.current = 0;
    } catch (error) {
      if (!isMounted.current) return;
      
      console.error("[useUserDialog] Lỗi khi lấy thông tin user:", error);
      
      // Chỉ xử lý error khi không phải do abort
      if (error.name !== 'AbortError') {
        handleError(error.message || "Không thể tải thông tin người dùng", shouldRetry);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [userId, isOpen, handleError, resetDialog]);

  return {
    user,
    isLoading,
    error,
    isSubmitting,
    setIsSubmitting,
    isMounted,
    fetchUser,
    resetDialog,
    handleError
  };
};
