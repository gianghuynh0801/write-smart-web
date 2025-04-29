
import { Settings } from "lucide-react";
import { WebhookUrlCard } from "@/components/admin/settings/WebhookUrlCard";
import { SmtpConfigCard } from "@/components/admin/settings/SmtpConfigCard";
import { ArticleCostCard } from "./settings/ArticleCostCard";
import { EmailVerificationToggle } from "./settings/EmailVerificationToggle";
import { useEffect } from "react";
import { useSystemConfig } from "@/hooks/useSystemConfig";

const AdminSettings = () => {
  // Đảm bảo cấu hình mặc định tồn tại
  const { ensureConfigExists } = useSystemConfig();

  useEffect(() => {
    const setupDefaultConfigs = async () => {
      // Đảm bảo các cấu hình mặc định tồn tại
      await ensureConfigExists('require_email_verification', 'false');
      await ensureConfigExists('article_cost', '1');
    };

    setupDefaultConfigs();
  }, [ensureConfigExists]);

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Cấu hình hệ thống</h1>
          <p className="text-muted-foreground">
            Quản lý cấu hình, tùy chỉnh hệ thống dành cho admin
          </p>
        </div>
      </div>
      
      <EmailVerificationToggle />
      <ArticleCostCard />
      <SmtpConfigCard />
      <WebhookUrlCard />
    </div>
  );
};

export default AdminSettings;
