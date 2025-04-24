
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AdminAuthCheck } from "@/components/admin/auth/AdminAuthCheck";
import { WebhookUrlForm } from "@/components/admin/settings/WebhookUrlForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const WebhookUrlCard = () => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState("");

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cấu hình webhook</CardTitle>
        <CardDescription>Quản lý cấu hình webhook cho n8n workflow</CardDescription>
      </CardHeader>
      <CardContent>
        <AdminAuthCheck onAuthSuccess={loadWebhookUrl} />
        <WebhookUrlForm initialUrl={webhookUrl} />
      </CardContent>
    </Card>
  );
};
