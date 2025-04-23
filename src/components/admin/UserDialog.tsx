
import { useEffect, useState } from "react";
import { Loader } from "lucide-react";

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

interface UserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string | number;
  onUserSaved: () => void;
}

const UserDialog = ({ isOpen, onClose, userId, onUserSaved }: UserDialogProps) => {
  const [user, setUser] = useState<User | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setUser(undefined);
        return;
      }
      
      setIsLoading(true);
      try {
        const userData = await getUserById(userId);
        setUser(userData);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải thông tin người dùng",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      fetchUser();
    }
  }, [userId, isOpen, toast]);
  
  const handleSubmit = async (data: UserFormValues) => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      if (userId) {
        await updateUser(userId, data);
        toast({
          title: "Thành công",
          description: "Cập nhật thông tin người dùng thành công"
        });
      } else {
        await createUser(data);
        toast({
          title: "Thành công",
          description: "Tạo người dùng mới thành công"
        });
      }
      onUserSaved();
      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu người dùng:", error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu thông tin",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false); // Always reset saving state, regardless of success or error
    }
  };
  
  // Ensure dialog closes properly
  const handleDialogClose = () => {
    if (!isSaving) {
      onClose();
    } else {
      toast({
        title: "Đang xử lý",
        description: "Vui lòng đợi trong khi chúng tôi lưu thông tin của bạn",
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{userId ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}</DialogTitle>
          <DialogDescription>
            {userId ? "Cập nhật thông tin người dùng" : "Nhập thông tin cho người dùng mới"}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <UserForm 
            user={user} 
            onSubmit={handleSubmit} 
            onCancel={handleDialogClose}
            isSubmitting={isSaving}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
