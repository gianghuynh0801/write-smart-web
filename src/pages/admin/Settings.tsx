
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getItem, setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

const AdminSettings = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  
  useEffect(() => {
    const storedUrl = getItem<string>(LOCAL_STORAGE_KEYS.WEBHOOK_URL, false);
    if (storedUrl) {
      setWebhookUrl(storedUrl);
    }
  }, []);

  const handleSaveWebhook = () => {
    try {
      // Kiểm tra URL hợp lệ
      new URL(webhookUrl);
      
      setItem(LOCAL_STORAGE_KEYS.WEBHOOK_URL, webhookUrl);
      toast({
        title: "Đã lưu cấu hình",
        description: "URL webhook đã được cập nhật thành công.",
      });
    } catch (error) {
      toast({
        title: "URL không hợp lệ",
        description: "Vui lòng nhập một URL webhook hợp lệ.",
        variant: "destructive",
      });
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
              <Label htmlFor="webhook-url">URL Webhook</Label>
              <Input
                id="webhook-url"
                placeholder="https://workflow.example.com/webhook/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                URL webhook được sử dụng để kết nối với n8n workflow
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
