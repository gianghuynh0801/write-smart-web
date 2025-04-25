
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Link, AlertCircle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface WebhookUrlFormProps {
  initialUrl: string;
  onSave?: (url: string) => void;
}

export const WebhookUrlForm = ({ initialUrl, onSave }: WebhookUrlFormProps) => {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState(initialUrl);
  const [isValidUrl, setIsValidUrl] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const validateUrl = (url: string): boolean => {
    if (!url) return true; // Empty URL is considered valid (optional field)
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSaveWebhook = async () => {
    if (webhookUrl && !validateUrl(webhookUrl)) {
      setIsValidUrl(false);
      toast({
        title: "URL không hợp lệ",
        description: "Vui lòng nhập một URL webhook hợp lệ.",
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

      // Thông báo cho component cha biết URL đã được lưu
      if (onSave) {
        onSave(webhookUrl);
      }
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
        className="flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Đang lưu...
          </>
        ) : (
          "Lưu cấu hình"
        )}
      </Button>
    </div>
  );
};
