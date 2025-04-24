
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

export const WebhookUrlCard = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    loadWebhookUrl();
  }, []);

  const loadWebhookUrl = async () => {
    try {
      console.log("Đang tải webhook URL từ database...");
      
      const { data, error } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'webhook_url')
        .single();

      if (error) {
        console.error('Lỗi khi tải webhook URL:', error);
        toast({
          title: "Lỗi khi tải dữ liệu",
          description: "Không thể tải URL webhook từ cơ sở dữ liệu.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        console.log("Đã tải webhook URL:", data.value);
        setWebhookUrl(data.value);
      } else {
        console.log("Không tìm thấy webhook URL trong database");
      }
    } catch (error) {
      console.error('Lỗi exception khi tải webhook URL:', error);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSaveWebhook = async () => {
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
    setIsLoading(true);
    
    try {
      console.log("Đang lưu webhook URL vào database:", webhookUrl);
      
      const { error } = await supabase
        .from('system_configurations')
        .upsert({ 
          key: 'webhook_url', 
          value: webhookUrl,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Lỗi khi lưu webhook URL:', error);
        toast({
          title: "Lỗi",
          description: "Không thể lưu URL webhook. Vui lòng thử lại sau.",
          variant: "destructive",
        });
        return;
      }

      console.log("Lưu webhook URL thành công");
      toast({
        title: "Đã lưu cấu hình",
        description: "URL webhook đã được cập nhật thành công.",
      });
    } catch (error) {
      console.error('Exception khi lưu webhook URL:', error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi lưu URL webhook.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
    <Card>
      <CardHeader>
        <CardTitle>Cấu hình webhook</CardTitle>
        <CardDescription>Quản lý cấu hình webhook cho n8n workflow</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url" className="flex items-center gap-2">
              <Link className="h-4 w-4" /> URL Webhook n8n
            </Label>
            <Input
              id="webhook-url"
              placeholder="Nhập URL webhook hợp lệ"
              value={webhookUrl}
              onChange={handleUrlChange}
              className={!isValidUrl && webhookUrl ? "border-destructive" : ""}
            />
            {!isValidUrl && webhookUrl && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  URL không hợp lệ. Vui lòng nhập một URL webhook hợp lệ.
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              URL webhook được sử dụng để kết nối với n8n workflow. Đảm bảo nhập một URL webhook hợp lệ.
            </p>
          </div>
          <Button 
            onClick={handleSaveWebhook} 
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu cấu hình"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
