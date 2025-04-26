
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
        .from('system_configurations')
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

      if (data) {
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
      // Tạo dữ liệu test đơn giản
      const testData = {
        keywords: {
          main: "Test Webhook",
          sub: ["Test1", "Test2"],
          related: ["Related1"]
        },
        outline: [{ heading: "H2", title: "Test Heading" }],
        knowledge: {
          webConnection: true,
          reference: ""
        },
        format: {
          bold: true,
          italic: true,
          useList: true
        },
        link_keywords: [],
        link_urls: [],
        images: {
          size: "medium"
        },
        content: {
          language: "vi",
          country: "vn",
          tone: "Neutral",
          narrator: "tự động",
          formality: "tự động"
        },
        timestamp: new Date().toISOString(),
        test: true
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log("Kết quả test webhook:", result);

      toast({
        title: "Test thành công",
        description: "Webhook URL đã hoạt động đúng, nhận được phản hồi từ server.",
      });
    } catch (error) {
      console.error('Lỗi khi test webhook:', error);
      toast({
        title: "Lỗi khi test webhook",
        description: error instanceof Error ? error.message : "Không thể kết nối đến webhook URL.",
        variant: "destructive",
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleWebhookSaved = (url: string) => {
    setWebhookUrl(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cấu hình webhook</CardTitle>
        <CardDescription>Quản lý cấu hình webhook cho n8n workflow</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminAuthCheck onAuthSuccess={loadWebhookUrl} />
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Đang tải...</span>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Alert>
                <AlertTitle className="flex items-center">
                  Hướng dẫn cấu hình Webhook
                </AlertTitle>
                <AlertDescription>
                  <p className="mt-2">
                    URL webhook này sẽ được sử dụng để kết nối với n8n để tạo bài viết.
                    Người dùng sẽ không thể tạo bài viết nếu URL này chưa được cấu hình.
                  </p>
                  <div className="mt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={() => window.open("https://n8n.io/", "_blank")}
                    >
                      <ExternalLink size={14} />
                      Tìm hiểu thêm về n8n
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            </div>
            
            <WebhookUrlForm initialUrl={webhookUrl} onSave={handleWebhookSaved} />
            
            {webhookUrl && (
              <div className="mt-4">
                <Button 
                  variant="secondary" 
                  onClick={testWebhook} 
                  disabled={isTestingWebhook}
                  className="flex items-center gap-2"
                >
                  {isTestingWebhook ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Kiểm tra kết nối webhook
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
