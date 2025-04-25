
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useSmtpConfig } from "./SmtpConfigContext";

export function GmailTip() {
  const { config } = useSmtpConfig();
  
  if (!config.host.includes('gmail')) return null;
  
  return (
    <Alert className="mt-4 bg-blue-50">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertTitle>Đang sử dụng Gmail?</AlertTitle>
      <AlertDescription>
        Nếu bạn đang sử dụng Gmail, cần sử dụng App Password thay vì mật khẩu thường.
        <a 
          href="https://support.google.com/accounts/answer/185833" 
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-1 text-blue-600 underline"
        >
          Hướng dẫn tạo App Password
        </a>
      </AlertDescription>
    </Alert>
  );
}
