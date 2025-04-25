
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SmtpConfig, TestResult } from "./types";
import { useToast } from "@/hooks/use-toast";

type SmtpConfigContextType = {
  config: SmtpConfig;
  setConfig: React.Dispatch<React.SetStateAction<SmtpConfig>>;
  configId: string | null;
  isLoading: boolean;
  isTesting: boolean;
  testResult: TestResult | null;
  testEmail: string;
  setTestEmail: (email: string) => void;
  handleSave: () => Promise<void>;
  handleTest: () => Promise<void>;
};

const SmtpConfigContext = createContext<SmtpConfigContextType | undefined>(undefined);

export const SmtpConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [configId, setConfigId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState('');
  const [config, setConfig] = useState<SmtpConfig>({
    host: '',
    port: '',
    username: '',
    password: '',
    from_email: '',
    from_name: ''
  });
  
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
            test_email: testEmail
          }
        },
      });

      if (response.error) throw response.error;

      const data = response.data;
      
      if (data?.success) {
        setTestResult({
          success: true,
          message: data.message || "Đã gửi email test thành công"
        });
        
        toast({
          title: "Thành công",
          description: data.message || "Đã gửi email test thành công. Vui lòng kiểm tra hộp thư.",
        });
      } else if (data?.message) {
        throw new Error(data.message);
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

  const value = {
    config,
    setConfig,
    configId,
    isLoading,
    isTesting,
    testResult,
    testEmail,
    setTestEmail,
    handleSave,
    handleTest
  };

  return (
    <SmtpConfigContext.Provider value={value}>
      {children}
    </SmtpConfigContext.Provider>
  );
};

export const useSmtpConfig = () => {
  const context = useContext(SmtpConfigContext);
  if (context === undefined) {
    throw new Error('useSmtpConfig must be used within a SmtpConfigProvider');
  }
  return context;
};
