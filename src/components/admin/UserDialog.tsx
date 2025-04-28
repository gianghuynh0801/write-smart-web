
import { useEffect, useState, useRef, useCallback } from "react";
import { Loader, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getUserById, createUser, updateUser } from "@/api/user/userCrud";
import { User, UserFormValues } from "@/types/user";
import UserForm from "./UserForm";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";
import { setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | number;
  onUserSaved: () => void;
}

const UserDialog = ({ isOpen, onClose, userId, onUserSaved }: UserDialogProps) => {
  const [user, setUser] = useState<User | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMounted = useRef(true);
  const { toast } = useToast();
  const retryCount = useRef(0);
  const maxRetries = 3;
  
  useEffect(() => {
    if (!isOpen) {
      setUser(undefined);
      setError(null);
      retryCount.current = 0;
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const fetchUser = useCallback(async (shouldRetry = true) => {
    if (!userId || !isOpen) {
      if (isMounted.current) {
        setUser(undefined);
        setError(null);
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
      
      if (isMounted.current) {
        const errorMessage = error.message || "Không thể tải thông tin người dùng";
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
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [userId, isOpen, toast]);
  
  useEffect(() => {
    if (isOpen && userId) {
      fetchUser();
    }
  }, [fetchUser, isOpen, userId]);
  
  // Đảm bảo admin đã đăng nhập trước khi gửi yêu cầu
  const ensureAuth = async () => {
    try {
      console.log("Kiểm tra phiên đăng nhập admin...");
      const { data: { session } } = await supabaseAdmin.auth.getSession();
      
      if (!session) {
        console.log("Không tìm thấy phiên đăng nhập, thử làm mới...");
        
        // Thử làm mới phiên đăng nhập
        const { data: refreshData, error: refreshError } = await supabaseAdmin.auth.refreshSession();
        
        if (refreshError || !refreshData.session) {
          console.error("Không thể làm mới phiên đăng nhập:", refreshError);
          return false;
        }
        
        console.log("Đã làm mới phiên đăng nhập thành công");
        
        // Lưu token mới vào localStorage
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, refreshData.session.access_token);
        return true;
      }
      
      console.log("Đã tìm thấy phiên đăng nhập hợp lệ");
      setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
      return true;
    } catch (authError) {
      console.error("Lỗi khi kiểm tra xác thực:", authError);
      return false;
    }
  };
  
  const handleSubmit = async (data: UserFormValues) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setError(null);
    
    // Đảm bảo admin đã đăng nhập trước khi thực hiện thao tác
    const isAuthenticated = await ensureAuth();
    
    if (!isAuthenticated) {
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      setIsSubmitting(false);
      toast({
        title: "Lỗi xác thực",
        description: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log("Đang lưu thông tin user:", data);
      
      let savedUser: User;
      
      if (userId) {
        // Thêm xử lý thử lại cho việc cập nhật
        let attempts = 0;
        const maxAttempts = 2;
        let lastError: Error | null = null;
        
        while (attempts < maxAttempts) {
          try {
            savedUser = await updateUser(userId, data);
            console.log("Cập nhật user thành công:", savedUser);
            lastError = null;
            break;
          } catch (updateError: any) {
            lastError = updateError;
            console.error(`Lỗi khi cập nhật (lần ${attempts + 1}/${maxAttempts}):`, updateError);
            
            // Nếu là lỗi xác thực, thử làm mới xác thực và thử lại
            if (updateError.message && 
              (updateError.message.includes('xác thực') || 
               updateError.message.includes('Xác thực') || 
               updateError.message.includes('401') || 
               updateError.message.includes('403') ||
               updateError.message.includes('phiên đăng nhập'))) {
              
              // Thử làm mới phiên đăng nhập
              await ensureAuth();
              await new Promise(resolve => setTimeout(resolve, 1000));
              attempts++;
            } else {
              // Nếu không phải lỗi xác thực, không thử lại
              break;
            }
          }
        }
        
        if (lastError) {
          throw lastError;
        }
        
        if (isMounted.current) {
          toast({
            title: "Thành công",
            description: "Cập nhật thông tin người dùng thành công"
          });
        }
      } else {
        savedUser = await createUser(data);
        if (isMounted.current) {
          toast({
            title: "Thành công",
            description: "Tạo người dùng mới thành công"
          });
        }
      }
      
      if (isMounted.current) {
        onClose();
        setTimeout(() => {
          onUserSaved();
        }, 300);
      }
    } catch (error: any) {
      console.error("Lỗi khi lưu thông tin user:", error);
      
      if (isMounted.current) {
        // Hiển thị thông báo lỗi chi tiết hơn
        let errorMessage = "Có lỗi xảy ra khi lưu thông tin";
        
        if (error.message) {
          errorMessage = error.message;
          
          // Xử lý các thông báo lỗi cụ thể
          if (error.message.includes('Edge Function returned a non-2xx status code')) {
            errorMessage = "Lỗi từ máy chủ: Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.";
          } else if (error.message.includes('Cannot read properties of null')) {
            errorMessage = "Lỗi dữ liệu: Phản hồi từ máy chủ không đúng định dạng. Vui lòng thử lại.";
          } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage = "Lỗi xác thực: Bạn không có quyền thực hiện thao tác này hoặc phiên làm việc đã hết hạn.";
          }
        }
        
        setError(errorMessage);
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      if (isMounted.current) {
        setIsSubmitting(false);
      }
    }
  };
  
  const handleRetry = () => {
    if (userId) {
      retryCount.current = 0;
      fetchUser();
    } else {
      setError(null);
    }
  };
  
  const handleDialogClose = () => {
    if (!isLoading && !isSubmitting) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent 
        className="sm:max-w-[600px]" 
        onInteractOutside={(e) => {
          if (isLoading || isSubmitting) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{userId ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
          <DialogDescription>
            {userId ? "Cập nhật thông tin người dùng" : "Nhập thông tin cho người dùng mới"}
          </DialogDescription>
        </DialogHeader>
        
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <div className="text-center space-y-2">
              <p className="font-medium text-destructive">{error}</p>
              <Button onClick={handleRetry} variant="outline" size="sm">
                Thử lại
              </Button>
            </div>
          </div>
        ) : isLoading && !user ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <UserForm 
            user={user}
            onSubmit={handleSubmit}
            onCancel={handleDialogClose}
            isSubmitting={isSubmitting}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
