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
  const isMounted = useRef(true);
  const { toast } = useToast();
  const retryCount = useRef(0);
  const maxRetries = 3;
  
  useEffect(() => {
    if (!isOpen) {
      setUser(undefined);
      setError(null);
      retryCount.current = 0;
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
  
  const handleSubmit = async (data: UserFormValues) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Đang lưu thông tin user:", data);
      if (userId) {
        await updateUser(userId, data);
        if (isMounted.current) {
          toast({
            title: "Thành công",
            description: "Cập nhật thông tin người dùng thành công"
          });
        }
      } else {
        await createUser(data);
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
        const errorMessage = error.message || "Có lỗi xảy ra khi lưu thông tin";
        setError(errorMessage);
        toast({
          title: "Lỗi",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };
  
  const handleRetry = () => {
    retryCount.current = 0;
    fetchUser();
  };
  
  const handleDialogClose = () => {
    if (!isLoading) {
      onClose();
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent 
        className="sm:max-w-[600px]" 
        onInteractOutside={(e) => {
          if (isLoading) {
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
            isSubmitting={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
