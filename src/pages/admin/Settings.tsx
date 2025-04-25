
import { Settings } from "lucide-react";
import { WebhookUrlCard } from "@/components/admin/settings/WebhookUrlCard";
import { SmtpConfigCard } from "@/components/admin/settings/SmtpConfigCard";

const AdminSettings = () => {
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
      
      <SmtpConfigCard />
      <WebhookUrlCard />
    </div>
  );
};

export default AdminSettings;
