
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function EmailVerificationCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const { toast } = useToast();

  // Fetch initial state
  useState(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('value')
        .eq('key', 'require_email_verification')
        .maybeSingle();

      if (!error && data) {
        setIsEnabled(data.value === 'true');
      }
    };

    fetchConfig();
  }, []);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const newValue = !isEnabled;
      const { error } = await supabase
        .from('system_configurations')
        .update({ value: String(newValue) })
        .eq('key', 'require_email_verification');

      if (error) throw error;

      setIsEnabled(newValue);
      toast({
        title: "Cập nhật thành công",
        description: `Đã ${newValue ? 'bật' : 'tắt'} xác thực email khi đăng ký.`,
      });
    } catch (error) {
      console.error('Error updating email verification setting:', error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật cấu hình xác thực email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Xác thực email</CardTitle>
        <CardDescription>
          Quản lý cấu hình xác thực email khi người dùng đăng ký tài khoản mới
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4">
          <Switch
            id="email-verification"
            checked={isEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
          <Label htmlFor="email-verification">
            {isEnabled ? 'Yêu cầu xác thực email' : 'Không yêu cầu xác thực email'}
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}
