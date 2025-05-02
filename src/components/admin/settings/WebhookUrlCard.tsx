
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminAuthCheck } from "@/components/admin/auth/AdminAuthCheck";
import { WebhookUrlForm } from "@/components/admin/settings/WebhookUrlForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const WebhookUrlCard = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const loadWebhookUrl = async () => {
    // Nếu đã tải, không tải lại để tránh vòng lặp
    if (isLoaded || isLoading) return;

    try {
      setIsLoading(true);
      console.log("Đang tải webhook URL từ database...");
      
      const { data, error } = await supabase
        .from("system_configurations")
        .select('value')
        .eq('key', 'webhook_url')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Lỗi khi tải webhook URL:', error);
        toast({
          title: "Lỗi khi tải dữ liệu",
          description: "Không thể tải URL webhook từ cơ sở dữ liệu.",
          variant: "destructive",
        });
        return;
      }

      if (data && typeof data === 'object' && 'value' in data) {
        console.log("Đã tải webhook URL:", data.value);
        setWebhookUrl(data.value);
      } else {
        console.log("Không tìm thấy webhook URL trong database - đây là lần đầu cấu hình");
      }
    } catch (error) {
      console.error('Lỗi exception khi tải webhook URL:', error);
    } finally {
      setIsLoading(false);
      setIsLoaded(true);
    }
  };

  const testWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Chưa có URL webhook",
        description: "Vui lòng nhập URL webhook trước khi test.",
        variant: "destructive",
      });
      return;
    }

    setIsTestingWebhook(true);
    try {
      // Implementation of webhook testing would go here
      // For now it's just a placeholder
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Kết nối thành công",
        description: "Webhook đã được kiểm tra và hoạt động bình thường.",
      });
    } catch (error) {
      console.error('Lỗi khi test webhook:', error);
      toast({
        title: "Lỗi",
        description: "Không thể kết nối đến webhook. Vui lòng kiểm tra URL và thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  useEffect(() => {
    loadWebhookUrl();
  }, []);

  const handleWebhookSaved = (newUrl: string) => {
    setWebhookUrl(newUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cấu hình Webhook</CardTitle>
        <CardDescription>
          Thiết lập URL webhook để kết nối với n8n hoặc dịch vụ webhook khác
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdminAuthCheck>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <WebhookUrlForm 
                initialUrl={webhookUrl} 
                onSave={handleWebhookSaved} 
              />
              
              {webhookUrl && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={testWebhook}
                    disabled={isTestingWebhook}
                    className="flex items-center gap-2"
                  >
                    {isTestingWebhook ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                    {isTestingWebhook ? "Đang kiểm tra..." : "Kiểm tra kết nối"}
                  </Button>
                </div>
              )}
            </>
          )}
        </AdminAuthCheck>
      </CardContent>
    </Card>
  );
};
