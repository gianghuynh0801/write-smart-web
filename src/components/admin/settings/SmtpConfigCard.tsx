
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";  // Changed from 'mail' to 'Mail'

export function SmtpConfigCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [config, setConfig] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    from_email: '',
    from_name: ''
  });
  const { toast } = useToast();

  // Fetch initial config
  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('system_configurations')
      .select('value')
      .eq('key', 'smtp_config')
      .maybeSingle();

    if (!error && data?.value) {
      try {
        setConfig(JSON.parse(data.value));
      } catch (e) {
        console.error('Error parsing SMTP config:', e);
      }
    }
  };

  // Save SMTP config
  const handleSave = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('system_configurations')
        .upsert({
          key: 'smtp_config',
          value: JSON.stringify(config)
        });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã lưu cấu hình SMTP",
      });
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      toast({
        title: "Lỗi",
        description: "Không thể lưu cấu hình SMTP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Test SMTP config by sending a test email
  const handleTest = async () => {
    setIsTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-smtp', {
        body: { config },
      });

      if (error) throw error;

      toast({
        title: "Thành công",
        description: "Đã gửi email test thành công",
      });
    } catch (error) {
      console.error('Error testing SMTP:', error);
      toast({
        title: "Lỗi",
        description: "Không thể gửi email test",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />  {/* Changed from 'mail' to 'Mail' */}
          <div>
            <CardTitle>Cấu hình SMTP</CardTitle>
            <CardDescription>
              Quản lý cấu hình SMTP để gửi email từ hệ thống
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input 
                id="smtp-host"
                value={config.host}
                onChange={(e) => setConfig(prev => ({ ...prev, host: e.target.value }))}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input 
                id="smtp-port"
                value={config.port}
                onChange={(e) => setConfig(prev => ({ ...prev, port: e.target.value }))}
                placeholder="587"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="smtp-username">Tên đăng nhập</Label>
              <Input 
                id="smtp-username"
                value={config.username}
                onChange={(e) => setConfig(prev => ({ ...prev, username: e.target.value }))}
                placeholder="your@email.com"
              />
            </div>
            <div>
              <Label htmlFor="smtp-password">Mật khẩu</Label>
              <Input 
                id="smtp-password"
                type="password"
                value={config.password}
                onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="from-email">Email người gửi</Label>
              <Input 
                id="from-email"
                value={config.from_email}
                onChange={(e) => setConfig(prev => ({ ...prev, from_email: e.target.value }))}
                placeholder="no-reply@yourcompany.com"
              />
            </div>
            <div>
              <Label htmlFor="from-name">Tên người gửi</Label>
              <Input 
                id="from-name"
                value={config.from_name}
                onChange={(e) => setConfig(prev => ({ ...prev, from_name: e.target.value }))}
                placeholder="Your Company Name"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting || isLoading}
            >
              {isTesting ? "Đang gửi..." : "Gửi email test"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || isTesting}
            >
              {isLoading ? "Đang lưu..." : "Lưu cấu hình"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
