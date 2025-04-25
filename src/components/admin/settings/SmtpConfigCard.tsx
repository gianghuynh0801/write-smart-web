
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { SmtpConfigForm } from "./smtp/SmtpConfigForm";
import { SmtpTestEmail } from "./smtp/SmtpTestEmail";
import { GmailTip } from "./smtp/GmailTip";
import { SmtpConfigProvider } from "./smtp/SmtpConfigContext";
import { SmtpSaveButton } from "./smtp/SmtpSaveButton";

export function SmtpConfigCard() {
  return (
    <SmtpConfigProvider>
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
            <SmtpConfigForm />
            <GmailTip />
            <SmtpTestEmail />
            <SmtpSaveButton />
          </div>
        </CardContent>
      </Card>
    </SmtpConfigProvider>
  );
}
