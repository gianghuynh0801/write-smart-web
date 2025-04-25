
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminAuthCheck } from "@/components/admin/auth/AdminAuthCheck";
import { WebhookUrlForm } from "@/components/admin/settings/WebhookUrlForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export const WebhookUrlCard = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const loadWebhookUrl = async () => {
    try {
      setIsLoading(true);
      console.log("Đang tải webhook URL từ database...");
      
      const { data, error } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'webhook_url')
        .maybeSingle(); // Sử dụng maybeSingle thay vì single để tránh lỗi khi không có dữ liệu

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
          <WebhookUrlForm initialUrl={webhookUrl} onSave={handleWebhookSaved} />
        )}
      </CardContent>
    </Card>
  );
};
