
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileFormState {
  name: string;
  email: string;
  bio: string;
  language: string;
}

interface ProfileFormProps {
  profileForm: ProfileFormState;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onLanguageChange: (value: string) => void;
}

export function ProfileForm({ profileForm, onSubmit, onChange, onLanguageChange }: ProfileFormProps) {
  return (
    <Card>
      <form onSubmit={onSubmit}>
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>
            Quản lý thông tin cá nhân và tùy chọn tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProfileAvatar name={profileForm.name} />

          <div className="space-y-2">
            <Label htmlFor="name">Họ và tên</Label>
            <Input
              id="name"
              name="name"
              value={profileForm.name}
              onChange={onChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={onChange}
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
              onChange={onChange}
              placeholder="Viết vài điều về bạn"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="language">Ngôn ngữ hiển thị</Label>
            <Select
              value={profileForm.language}
              onValueChange={onLanguageChange}
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
  );
}
