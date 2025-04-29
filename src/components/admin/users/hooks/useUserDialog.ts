
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
  const maxRetries = 2; // Giảm số lần retry xuống
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fetchDelayRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Đảm bảo các biến tham chiếu được reset khi component unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (fetchDelayRef.current) {
        clearTimeout(fetchDelayRef.current);
      }
    };
  }, []);

  // Reset state khi dialog mở/đóng
  useEffect(() => {
    if (!isOpen) {
      // Đảm bảo hủy các request đang chạy khi dialog đóng
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }
      if (fetchDelayRef.current) {
        clearTimeout(fetchDelayRef.current);
        fetchDelayRef.current = null;
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
    
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
      fetchTimeoutRef.current = null;
    }
    
    if (fetchDelayRef.current) {
      clearTimeout(fetchDelayRef.current);
      fetchDelayRef.current = null;
    }
  }, []);

  const handleError = useCallback((errorMessage: string, shouldRetry = true) => {
    if (!isMounted.current) return;
    
    setError(errorMessage);
    
    if (shouldRetry && retryCount.current < maxRetries) {
      retryCount.current += 1;
      console.log(`[useUserDialog] Đang thử lại lần ${retryCount.current}/${maxRetries}...`);
      
      // Tăng thời gian chờ giữa các lần retry
      const retryDelay = 1500 * retryCount.current;
      
      // Sử dụng ref để có thể hủy timeout khi cần
      fetchTimeoutRef.current = setTimeout(() => {
        fetchTimeoutRef.current = null;
        if (isMounted.current) {
          fetchUser(true);
        }
      }, retryDelay);
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
    
    // Hủy timeout trước đó nếu có
    if (fetchDelayRef.current) {
      clearTimeout(fetchDelayRef.current);
    }
    
    // Trì hoãn fetch để tránh quá nhiều request liên tiếp
    fetchDelayRef.current = setTimeout(() => {
      fetchDelayRef.current = null;
      
      // Tạo controller mới cho request hiện tại
      abortControllerRef.current = new AbortController();
      
      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
      }

      const timeoutPromise = new Promise<never>((_, reject) => {
        const id = setTimeout(() => {
          reject(new Error("Timeout khi lấy thông tin người dùng"));
        }, 8000); // Giảm xuống 8 giây
        
        // Đảm bảo timeout được xóa khi abort
        abortControllerRef.current?.signal.addEventListener('abort', () => {
          clearTimeout(id);
        });
      });

      // Race giữa fetch user và timeout
      Promise.race([
        getUserById(userId),
        timeoutPromise
      ])
      .then(userData => {
        if (!isMounted.current) return;
        
        console.log("[useUserDialog] Đã lấy được thông tin user:", userData);
        setUser(userData);
        setError(null);
      })
      .catch(error => {
        if (!isMounted.current) return;
        
        console.error("[useUserDialog] Lỗi khi lấy thông tin user:", error);
        
        // Chỉ xử lý error khi không phải do abort
        if (error.name !== 'AbortError') {
          handleError(error.message || "Không thể tải thông tin người dùng", shouldRetry);
        }
      })
      .finally(() => {
        if (isMounted.current) {
          setIsLoading(false);
        }
      });
      
    }, 300); // Trì hoãn 300ms để giảm số lượng request
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
