
import { useState, useEffect } from "react";
import { Loader, AlertTriangle, X } from "lucide-react";

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
  const [safetyTimer, setSafetyTimer] = useState<number | null>(null);

  // Thêm hàm xử lý để bảo vệ khỏi treo vĩnh viễn
  useEffect(() => {
    let timer: number | null = null;
    
    if (isDeleting || isProcessing) {
      // Thiết lập timeout an toàn nếu đang xử lý
      timer = window.setTimeout(() => {
        console.log("[DeleteUserDialog] Đang reset trạng thái sau thời gian chờ tối đa");
        setIsDeleting(false);
        setError("Quá trình xóa người dùng mất quá nhiều thời gian. Vui lòng thử lại sau.");
      }, 15000); // 15 giây là thời gian tối đa cho quá trình xóa
      
      setSafetyTimer(timer);
    } else {
      // Xóa timer nếu không còn xử lý
      if (safetyTimer) {
        clearTimeout(safetyTimer);
        setSafetyTimer(null);
      }
    }
    
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isDeleting, isProcessing, safetyTimer]);

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
  
  // Thêm cơ chế đóng khẩn cấp trong trường hợp cần thiết
  const handleForceClose = () => {
    // Force close nên chỉ được sử dụng trong trường hợp khẩn cấp
    if (isDeleting || isProcessing) {
      console.log("[DeleteUserDialog] Bắt buộc đóng dialog khi đang trong trạng thái xử lý");
      setIsDeleting(false);
    }
    setError(null);
    onClose();
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
          <div className="flex justify-between w-full items-center">
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              onClick={handleForceClose}
              className={`${isDisabled ? 'visible' : 'invisible'} flex items-center text-gray-500 hover:text-red-600`}
            >
              <X className="h-4 w-4 mr-1" /> Bắt buộc đóng
            </Button>
            
            <div className="flex space-x-2">
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
            </div>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteUserDialog;
