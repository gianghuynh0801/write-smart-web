import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function SmtpConfigCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success?: boolean; message?: string} | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [config, setConfig] = useState({
    host: '',
    port: '',
    username: '',
    password: '',
    from_email: '',
    from_name: ''
  });
  const [testEmail, setTestEmail] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('id, value')
        .eq('key', 'smtp_config')
        .maybeSingle();

      if (error) {
        console.error('Error fetching SMTP config:', error);
        throw error;
      }
      
      if (data) {
        setConfigId(data.id);
        console.log("Fetched SMTP config with ID:", data.id);
        
        if (data.value) {
          try {
            const parsedConfig = JSON.parse(data.value);
            setConfig(parsedConfig);
          } catch (e) {
            console.error('Error parsing SMTP config:', e);
            toast({
              title: "Lỗi",
              description: "Không thể đọc cấu hình SMTP",
              variant: "destructive",
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching SMTP config:', error);
      toast({
        title: "Lỗi",
        description: "Không thể tải cấu hình SMTP",
        variant: "destructive",
      });
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      console.log("Saving SMTP config:", JSON.stringify(config));
      
      let operation;
      const configData = {
        key: 'smtp_config',
        value: JSON.stringify(config)
      };
      
      if (configId) {
        console.log(`Updating existing config with ID: ${configId}`);
        operation = supabase
          .from('system_configurations')
          .update(configData)
          .eq('id', configId);
      } else {
        console.log("Inserting new config record");
        operation = supabase
          .from('system_configurations')
          .insert(configData);
      }
      
      const { data, error } = await operation;

      if (error) {
        console.error('Error saving SMTP config:', error);
        throw error;
      }

      console.log("SMTP config saved successfully:", data);
      
      if (!configId) {
        await fetchConfig();
      }
      
      toast({
        title: "Thành công",
        description: "Đã lưu cấu hình SMTP",
      });
      
      setTestResult(null);
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

  const validateForm = () => {
    const requiredFields = ['host', 'port', 'username', 'password', 'from_email'];
    const missingFields = requiredFields.filter(field => !config[field as keyof typeof config]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Thiếu thông tin",
        description: `Vui lòng điền đầy đủ các trường: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleTest = async () => {
    if (!validateForm()) return;
    
    if (!testEmail) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng nhập email để gửi test",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);
    
    try {
      console.log("Testing SMTP configuration with test email:", testEmail);
      
      const response = await supabase.functions.invoke('test-smtp', {
        body: { 
          config: {
            ...config,
            username: testEmail
          }
        },
      });

      console.log("SMTP test response:", response);
      
      if (response.error) {
        console.error("Function error:", response.error);
        throw new Error(response.error.message || "Lỗi gọi edge function");
      }

      const data = response.data;
      
      if (data && data.success) {
        setTestResult({
          success: true,
          message: "Đã gửi email test thành công"
        });
        
        toast({
          title: "Thành công",
          description: "Đã gửi email test thành công. Vui lòng kiểm tra hộp thư.",
          variant: "default",
        });
      } else if (data && data.error) {
        throw new Error(data.error);
      } else {
        throw new Error('Lỗi không xác định khi gửi email');
      }
    } catch (error: any) {
      console.error('Error testing SMTP:', error);
      
      setTestResult({
        success: false,
        message: `Không thể gửi email test: ${error.message || 'Lỗi không xác định'}`
      });
      
      toast({
        title: "Lỗi",
        description: `Không thể gửi email test: ${error.message || 'Lỗi không xác định'}`,
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const renderEmailProviderTips = () => {
    if (config.host.includes('gmail')) {
      return (
        <Alert className="mt-4 bg-blue-50">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertTitle>Đang sử dụng Gmail?</AlertTitle>
          <AlertDescription>
            Nếu bạn đang sử dụng Gmail, cần sử dụng App Password thay vì mật khẩu thường.
            <a 
              href="https://support.google.com/accounts/answer/185833" 
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 text-blue-600 underline"
            >
              Hướng dẫn tạo App Password
            </a>
          </AlertDescription>
        </Alert>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mail className="h-6 w-6 text-primary" />
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
              <p className="text-xs text-muted-foreground mt-1">
                Lưu ý: Nhiều máy chủ SMTP yêu cầu email người gửi phải khớp với email đăng nhập
              </p>
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
          
          {renderEmailProviderTips()}
          
          <div className="space-y-2">
            <Label htmlFor="test-email">Email kiểm tra</Label>
            <Input 
              id="test-email"
              type="email"
              placeholder="Nhập email để gửi test"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Nhập email của bạn để nhận email kiểm tra cấu hình SMTP
            </p>
          </div>
          
          {testResult && (
            <Alert variant={testResult.success ? "default" : "destructive"}>
              <AlertTitle>{testResult.success ? "Thành công" : "Lỗi"}</AlertTitle>
              <AlertDescription>{testResult.message}</AlertDescription>
            </Alert>
          )}
          
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
