
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EmailVerificationToggle } from "./EmailVerificationToggle";

export function NotificationsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tùy chọn thông báo</CardTitle>
          <CardDescription>
            Cài đặt cách bạn nhận thông báo từ hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Thông báo trong ứng dụng</p>
                <p className="text-sm text-muted-foreground">
                  Nhận thông báo trong ứng dụng về hoạt động tài khoản
                </p>
              </div>
              <Switch id="app-notifications" defaultChecked />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Thông báo email</p>
                <p className="text-sm text-muted-foreground">
                  Nhận các thông báo quan trọng qua email
                </p>
              </div>
              <EmailVerificationToggle />
            </div>
          </div>
          <div className="pt-4">
            <Button variant="outline">Lưu thay đổi</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
