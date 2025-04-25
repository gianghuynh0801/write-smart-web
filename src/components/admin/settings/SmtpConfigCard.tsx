
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from "lucide-react";
import { SmtpConfigForm } from "./smtp/SmtpConfigForm";
import { SmtpTestEmail } from "./smtp/SmtpTestEmail";
import { GmailTip } from "./smtp/GmailTip";
import type { SmtpConfig, TestResult } from "./smtp/types";

export function SmtpConfigCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [config, setConfig] = useState<SmtpConfig>({
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

      if (error) throw error;
      
      if (data) {
        setConfigId(data.id);
        console.log("Fetched SMTP config with ID:", data.id);
        
        if (data.value) {
          const parsedConfig = JSON.parse(data.value);
          setConfig(parsedConfig);
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

  const validateForm = () => {
    const requiredFields = ['host', 'port', 'username', 'password', 'from_email'];
    const missingFields = requiredFields.filter(field => !config[field as keyof SmtpConfig]);
    
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

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      const configData = {
        key: 'smtp_config',
        value: JSON.stringify(config)
      };
      
      const operation = configId
        ? supabase
            .from('system_configurations')
            .update(configData)
            .eq('id', configId)
        : supabase
            .from('system_configurations')
            .insert(configData);
      
      const { error } = await operation;
      if (error) throw error;

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

      if (response.error) throw response.error;

      const data = response.data;
      
      if (data?.success) {
        setTestResult({
          success: true,
          message: "Đã gửi email test thành công"
        });
        
        toast({
          title: "Thành công",
          description: "Đã gửi email test thành công. Vui lòng kiểm tra hộp thư.",
        });
      } else if (data?.error) {
        throw new Error(data.error);
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
        <div className="space-y-6">
          <SmtpConfigForm 
            config={config}
            onChange={setConfig}
          />
          
          <GmailTip show={config.host.includes('gmail')} />
          
          <SmtpTestEmail
            testEmail={testEmail}
            onTestEmailChange={setTestEmail}
            onTest={handleTest}
            isTesting={isTesting}
            testResult={testResult}
          />
          
          <div className="flex justify-end">
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
