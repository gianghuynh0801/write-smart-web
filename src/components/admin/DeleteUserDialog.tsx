
import { useState } from "react";
import { Loader, AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteUserDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  userName: string;
  isProcessing?: boolean;
}

const DeleteUserDialog = ({ isOpen, onClose, onConfirm, userName, isProcessing = false }: DeleteUserDialogProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (isDeleting || isProcessing) return;
    
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      // Không đóng dialog ở đây vì sẽ được xử lý bởi useUserDialogHandlers
    } catch (err) {
      console.error("Lỗi khi xóa người dùng:", err);
      setError(err instanceof Error ? err.message : "Lỗi không xác định khi xóa người dùng");
      setIsDeleting(false);
      // Không đóng dialog khi có lỗi
    }
  };

  const handleClose = () => {
    if (!isDeleting && !isProcessing) {
      setError(null);
      onClose();
    }
  };
  
  const isDisabled = isDeleting || isProcessing;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa người dùng</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn xóa người dùng <span className="font-medium">{userName}</span>? 
            Hành động này không thể hoàn tác và tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md border border-red-200 mb-4">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-800">Có lỗi xảy ra</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDisabled}>Hủy bỏ</AlertDialogCancel>
          <Button 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isDisabled}
          >
            {isDisabled ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Đang xóa...
              </>
            ) : (
              "Xóa"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
