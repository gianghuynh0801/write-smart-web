
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormState {
  name: string;
  email: string;
  bio: string;
  language: string;
}

export function ProfileTab() {
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: "Nguyễn Văn A",
    email: "user@example.com",
    bio: "Tôi là content creator",
    language: "vietnamese"
  });

  const { toast } = useToast();

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileLanguageChange = (value: string) => {
    setProfileForm(prev => ({ ...prev, language: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thông tin cá nhân đã được cập nhật",
      description: "Thông tin của bạn đã được lưu thành công."
    });
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
}
