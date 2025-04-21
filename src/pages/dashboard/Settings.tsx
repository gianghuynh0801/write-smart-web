
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Languages, Bell, Shield, Mail, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [profileForm, setProfileForm] = useState({
    name: "Nguyễn Văn A",
    email: "user@example.com",
    bio: "Tôi là content creator",
    language: "vietnamese"
  });
  
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    contentCreated: true,
    creditsLow: true,
    marketingEmails: false
  });
  
  const { toast } = useToast();
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleProfileLanguageChange = (value: string) => {
    setProfileForm(prev => ({ ...prev, language: value }));
  };
  
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (name: string, checked: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thông tin cá nhân đã được cập nhật",
      description: "Thông tin của bạn đã được lưu thành công."
    });
  };
  
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!securityForm.currentPassword || !securityForm.newPassword || !securityForm.confirmPassword) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin mật khẩu.",
        variant: "destructive"
      });
      return;
    }
    
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast({
        title: "Mật khẩu mới không khớp",
        description: "Vui lòng nhập lại mật khẩu mới.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real implementation, this would update the password with Supabase Auth
    toast({
      title: "Mật khẩu đã được cập nhật",
      description: "Mật khẩu của bạn đã được thay đổi thành công."
    });
    
    // Reset form
    setSecurityForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };
  
  const handleNotificationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Cài đặt thông báo đã được cập nhật",
      description: "Tùy chọn thông báo của bạn đã được lưu thành công."
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Cài đặt</h1>
        <p className="text-gray-500">
          Quản lý thông tin cá nhân và tùy chọn tài khoản
        </p>
      </div>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Hồ sơ
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Bảo mật
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Thông báo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4 py-4">
          <Card>
            <form onSubmit={handleProfileSubmit}>
              <CardHeader>
                <CardTitle>Thông tin cá nhân</CardTitle>
                <CardDescription>
                  Quản lý thông tin cá nhân và tùy chọn tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src="https://randomuser.me/api/portraits/men/32.jpg" alt="Avatar" />
                    <AvatarFallback>NA</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      Thay đổi ảnh đại diện
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, GIF hoặc PNG. Tối đa 2MB.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name">Họ và tên</Label>
                  <Input
                    id="name"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    disabled
                  />
                  <p className="text-xs text-gray-500">
                    Email không thể thay đổi sau khi đã đăng ký
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Tiểu sử</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={profileForm.bio}
                    onChange={handleProfileChange}
                    placeholder="Viết vài điều về bạn"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Ngôn ngữ hiển thị</Label>
                  <Select
                    defaultValue={profileForm.language}
                    onValueChange={handleProfileLanguageChange}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Chọn ngôn ngữ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vietnamese">Tiếng Việt</SelectItem>
                      <SelectItem value="english">Tiếng Anh</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Lưu thay đổi</Button>
              </CardFooter>
            </form>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Xóa tài khoản</CardTitle>
              <CardDescription>
                Xóa vĩnh viễn tài khoản và tất cả dữ liệu của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 text-sm mb-4">
                Khi bạn xóa tài khoản của mình, tất cả dữ liệu của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục.
                Hãy chắc chắn bạn đã sao lưu bất kỳ dữ liệu nào bạn muốn giữ lại.
              </p>
              <Button variant="destructive">
                Xóa tài khoản
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4 py-4">
          <Card>
            <form onSubmit={handleSecuritySubmit}>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu của bạn để bảo mật tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={handleSecurityChange}
                    />
                    <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={securityForm.newPassword}
                      onChange={handleSecurityChange}
                    />
                    <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500">
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ, số và ký tự đặc biệt
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={securityForm.confirmPassword}
                      onChange={handleSecurityChange}
                    />
                    <Key className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit">Cập nhật mật khẩu</Button>
              </CardFooter>
            </form>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Phiên đăng nhập</CardTitle>
              <CardDescription>
                Quản lý các phiên đăng nhập của bạn trên các thiết bị
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border">
                <div className="grid grid-cols-3 p-4 font-medium border-b bg-gray-50">
                  <div>Thiết bị</div>
                  <div>Đăng nhập lần cuối</div>
                  <div>Trạng thái</div>
                </div>
                <div className="divide-y">
                  <div className="grid grid-cols-3 p-4">
                    <div className="font-medium">Máy tính hiện tại</div>
                    <div className="text-gray-500">Vừa xong</div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Đang hoạt động
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 p-4">
                    <div className="font-medium">iPhone</div>
                    <div className="text-gray-500">2 ngày trước</div>
                    <div>
                      <Button variant="ghost" size="sm" className="h-7 text-red-500 hover:text-red-700 hover:bg-red-50">
                        Đăng xuất
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button variant="outline" className="w-full">
                Đăng xuất khỏi tất cả thiết bị khác
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4 py-4">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
