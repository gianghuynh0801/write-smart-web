
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useSmtpConfig } from "./SmtpConfigContext";

export function SmtpTestEmail() {
  const { testEmail, setTestEmail, handleTest, isTesting, testResult } = useSmtpConfig();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="test-email">Email kiểm tra</Label>
        <Input 
          id="test-email"
          type="email"
          placeholder="Nhập email để gửi test"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Nhập email của bạn để nhận email kiểm tra cấu hình SMTP
        </p>
      </div>
      
      {testResult && (
        <Alert variant={testResult.success ? "default" : "destructive"}>
          <AlertTitle>{testResult.success ? "Thành công" : "Lỗi"}</AlertTitle>
          <AlertDescription>{testResult.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={handleTest}
          disabled={isTesting}
        >
          {isTesting ? "Đang gửi..." : "Gửi email test"}
        </Button>
      </div>
    </div>
  );
}
