
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useSystemConfig } from "@/hooks/useSystemConfig";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const EmailVerificationToggle = () => {
  const [required, setRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { getConfig, updateConfig } = useSystemConfig();

  useEffect(() => {
    const loadConfig = async () => {
      setIsLoading(true);
      try {
        const value = await getConfig('require_email_verification');
        setRequired(value === 'true');
      } catch (error) {
        console.error("Lỗi khi tải cấu hình xác thực email:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, [getConfig]);

  const handleToggle = (checked: boolean) => {
    setRequired(checked);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig('require_email_verification', required ? 'true' : 'false');
      toast({
        title: "Đã lưu cấu hình",
        description: `Xác thực email đã được ${required ? 'bật' : 'tắt'}.`,
      });
    } catch (error) {
      console.error("Lỗi khi lưu cấu hình:", error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cài đặt xác thực email</CardTitle>
        <CardDescription>
          Quản lý cấu hình liên quan đến xác thực email người dùng
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <Switch
                id="email-verification"
                checked={required}
                onCheckedChange={handleToggle}
              />
              <Label htmlFor="email-verification">
                Yêu cầu xác thực email trước khi đăng nhập
              </Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {required
                ? "Người dùng sẽ cần xác thực email trước khi có thể đăng nhập vào hệ thống."
                : "Người dùng có thể đăng nhập mà không cần xác thực email trước."}
            </p>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="mt-2"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu cấu hình
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
