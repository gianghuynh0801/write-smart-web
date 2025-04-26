
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface VerificationDialogProps {
  open: boolean;
  email: string;
  onClose: () => void;
}

export const VerificationDialog = ({ open, email, onClose }: VerificationDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Xác thực email của bạn</DialogTitle>
          <DialogDescription className="text-center">
            Chúng tôi đã gửi email xác thực đến <strong>{email}</strong>
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="rounded-full bg-blue-100 p-3">
            <Mail className="h-8 w-8 text-blue-600" />
          </div>
          <div className="text-center space-y-2">
            <p>Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác thực để kích hoạt tài khoản.</p>
            <p className="text-sm text-gray-500">Nếu bạn không nhận được email, hãy kiểm tra thư mục spam hoặc thử đăng ký lại.</p>
          </div>
          <Button className="mt-4" onClick={onClose}>
            Đã hiểu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
