
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WebhookAlertProps {
  isAdmin: boolean;
  isLoading: boolean;
  hasWebhook: boolean | null;
}

const WebhookAlert = ({ isAdmin, isLoading, hasWebhook }: WebhookAlertProps) => {
  // Hiển thị cảnh báo khi không có webhook và đã tải xong dữ liệu
  if (hasWebhook !== false || isLoading) return null;

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Cần cấu hình webhook URL</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>
          Hệ thống chưa có URL webhook được cấu hình. Để sử dụng tính năng tạo nội dung,
          vui lòng yêu cầu quản trị viên cấu hình URL webhook.
        </p>
        {isAdmin && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
            onClick={() => window.location.href = '/admin/settings'}
          >
            <Settings className="h-4 w-4" /> 
            Đi đến trang cấu hình
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default WebhookAlert;
