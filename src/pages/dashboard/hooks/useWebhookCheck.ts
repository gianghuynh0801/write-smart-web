
import { useState, useEffect } from "react";
import { db } from "@/integrations/supabase/typeSafeClient";
import { checkAdminRole } from "@/services/admin/adminService";

interface WebhookCheckResult {
  hasWebhook: boolean | null;
  isAdmin: boolean;
  isLoading: boolean;
}

export const useWebhookCheck = (): WebhookCheckResult => {
  const [hasWebhook, setHasWebhook] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkWebhookAndAdminStatus = async () => {
      setIsLoading(true);
      try {
        console.log("Bắt đầu kiểm tra webhook URL và quyền admin...");
        
        // Kiểm tra webhook URL từ cấu hình hệ thống
        const { data: webhookData, error: webhookError } = await db.system_configurations()
          .select('value')
          .eq('key', 'webhook_url')
          .maybeSingle();

        if (webhookError) {
          console.error('Lỗi khi kiểm tra webhook URL:', webhookError);
        } else {
          console.log("Kết quả kiểm tra webhook URL:", webhookData);
          const webhookValue = webhookData && typeof webhookData === 'object' && 'value' in webhookData ? 
            (webhookData as any).value : null;
          setHasWebhook(!!webhookValue);
        }

        // Kiểm tra quyền admin của người dùng hiện tại
        const { data: { session } } = await db.auth.getSession();
        if (session) {
          const { roleData } = await checkAdminRole(session.user.id);
          setIsAdmin(!!roleData);
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra webhook hoặc quyền admin:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWebhookAndAdminStatus();
  }, []);

  return { hasWebhook, isAdmin, isLoading };
};
