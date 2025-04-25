
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface NotificationSettings {
  emailNotifications: boolean;
  contentCreated: boolean;
  creditsLow: boolean;
  marketingEmails: boolean;
}

export function NotificationsTab() {
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    contentCreated: true,
    creditsLow: true,
    marketingEmails: false
  });

  const { toast } = useToast();

  const handleNotificationChange = (name: keyof NotificationSettings, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cài đặt thông báo đã được cập nhật",
      description: "Tùy chọn thông báo của bạn đã được lưu thành công."
    });
  };

  return (
    <Card>
      <form onSubmit={handleNotificationSubmit}>
        <CardHeader>
          <CardTitle>Tùy chọn thông báo</CardTitle>
          <CardDescription>
            Quyết định cách bạn muốn nhận thông báo từ WriteSmart
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="emailNotifications">Thông báo qua email</Label>
              <p className="text-sm text-gray-500">
                Nhận thông báo quan trọng qua email
              </p>
            </div>
            <Switch
              id="emailNotifications"
              checked={notificationSettings.emailNotifications}
              onCheckedChange={(checked) => handleNotificationChange("emailNotifications", checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="contentCreated">Nội dung được tạo</Label>
              <p className="text-sm text-gray-500">
                Nhận thông báo khi nội dung của bạn được tạo xong
              </p>
            </div>
            <Switch
              id="contentCreated"
              checked={notificationSettings.contentCreated}
              onCheckedChange={(checked) => handleNotificationChange("contentCreated", checked)}
              disabled={!notificationSettings.emailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="creditsLow">Tín dụng thấp</Label>
              <p className="text-sm text-gray-500">
                Nhận thông báo khi tín dụng của bạn thấp
              </p>
            </div>
            <Switch
              id="creditsLow"
              checked={notificationSettings.creditsLow}
              onCheckedChange={(checked) => handleNotificationChange("creditsLow", checked)}
              disabled={!notificationSettings.emailNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketingEmails">Email tiếp thị</Label>
              <p className="text-sm text-gray-500">
                Nhận email về sản phẩm, tính năng và ưu đãi mới
              </p>
            </div>
            <Switch
              id="marketingEmails"
              checked={notificationSettings.marketingEmails}
              onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Lưu tùy chọn</Button>
        </CardFooter>
      </form>
    </Card>
  );
}
