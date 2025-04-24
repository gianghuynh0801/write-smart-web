
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Link, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getItem, setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminSettings = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);
  
  useEffect(() => {
    const storedUrl = getItem<string>(LOCAL_STORAGE_KEYS.WEBHOOK_URL, false);
    if (storedUrl) {
      setWebhookUrl(storedUrl);
    }
  }, []);

  const validateUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSaveWebhook = () => {
    if (!webhookUrl) {
      toast({
        title: "URL không được để trống",
        description: "Vui lòng nhập URL webhook.",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(webhookUrl)) {
      setIsValidUrl(false);
      toast({
        title: "URL không hợp lệ",
        description: "Vui lòng nhập một URL hợp lệ.",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidUrl(true);
    setItem(LOCAL_STORAGE_KEYS.WEBHOOK_URL, webhookUrl);
    toast({
      title: "Đã lưu cấu hình",
      description: "URL webhook đã được cập nhật thành công.",
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setWebhookUrl(newUrl);
    if (newUrl && !validateUrl(newUrl)) {
      setIsValidUrl(false);
    } else {
      setIsValidUrl(true);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Cấu hình hệ thống</CardTitle>
            <CardDescription>Quản lý cấu hình, tùy chỉnh hệ thống dành cho admin</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url" className="flex items-center gap-2">
                <Link className="h-4 w-4" /> URL Webhook n8n
              </Label>
              <Input
                id="webhook-url"
                placeholder="https://workflow.matbao.support/webhook/..."
                value={webhookUrl}
                onChange={handleUrlChange}
                className={!isValidUrl && webhookUrl ? "border-destructive" : ""}
              />
              {!isValidUrl && webhookUrl && (
                <Alert variant="destructive" className="mt-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    URL không hợp lệ. Đảm bảo nó có định dạng đúng (ví dụ: https://workflow.matbao.support/webhook/id)
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                URL webhook được sử dụng để kết nối với n8n workflow. Đảm bảo URL có dạng: https://workflow.matbao.support/webhook/[your-webhook-id]
              </p>
            </div>
            <Button onClick={handleSaveWebhook}>
              Lưu cấu hình
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
