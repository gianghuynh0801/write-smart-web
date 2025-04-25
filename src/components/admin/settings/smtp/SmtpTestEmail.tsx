
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { type TestResult } from "./types";

interface SmtpTestEmailProps {
  testEmail: string;
  onTestEmailChange: (email: string) => void;
  onTest: () => void;
  isTesting: boolean;
  testResult: TestResult | null;
}

export function SmtpTestEmail({ 
  testEmail, 
  onTestEmailChange, 
  onTest, 
  isTesting,
  testResult 
}: SmtpTestEmailProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="test-email">Email kiểm tra</Label>
        <Input 
          id="test-email"
          type="email"
          placeholder="Nhập email để gửi test"
          value={testEmail}
          onChange={(e) => onTestEmailChange(e.target.value)}
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
          onClick={onTest}
          disabled={isTesting}
        >
          {isTesting ? "Đang gửi..." : "Gửi email test"}
        </Button>
      </div>
    </div>
  );
}
