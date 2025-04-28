
import { useState, useRef, useCallback } from "react";
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
  const maxRetries = 3;
  const { toast } = useToast();

  const resetDialog = useCallback(() => {
    setUser(undefined);
    setError(null);
    retryCount.current = 0;
    setIsSubmitting(false);
  }, []);

  const handleError = useCallback((errorMessage: string, shouldRetry = true) => {
    if (isMounted.current) {
      setError(errorMessage);
      
      if (shouldRetry && retryCount.current < maxRetries) {
        retryCount.current += 1;
        console.log(`Đang thử lại lần ${retryCount.current}/${maxRetries}...`);
        
        setTimeout(() => {
          fetchUser(true);
        }, 1000 * retryCount.current);
      } else if (retryCount.current >= maxRetries) {
        toast({
          title: "Lỗi",
          description: `${errorMessage}. Đã thử lại ${maxRetries} lần không thành công.`,
          variant: "destructive"
        });
      }
    }
  }, [maxRetries, toast]);

  const fetchUser = useCallback(async (shouldRetry = true) => {
    if (!userId || !isOpen) {
      if (isMounted.current) {
        resetDialog();
      }
      return;
    }
    
    if (isMounted.current) {
      setIsLoading(true);
      setError(null);
    }

    try {
      console.log("Đang lấy thông tin user:", userId);
      const userData = await getUserById(userId);
      
      if (isMounted.current) {
        console.log("Đã lấy được thông tin user:", userData);
        setUser(userData);
        setError(null);
      }
    } catch (error: any) {
      console.error("Lỗi khi lấy thông tin user:", error);
      handleError(error.message || "Không thể tải thông tin người dùng", shouldRetry);
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
