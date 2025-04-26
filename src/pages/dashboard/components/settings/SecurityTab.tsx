
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityFormState {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function SecurityTab() {
  const [securityForm, setSecurityForm] = useState<SecurityFormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { toast } = useToast();

  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecurityForm(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
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
    
    toast({
      title: "Mật khẩu đã được cập nhật",
      description: "Mật khẩu của bạn đã được thay đổi thành công."
    });
    
    setSecurityForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
  };

  return (
    <div className="space-y-4">
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
                  type={showPasswords.current ? "text" : "password"}
                  value={securityForm.currentPassword}
                  onChange={handleSecurityChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={securityForm.newPassword}
                  onChange={handleSecurityChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
                  type={showPasswords.confirm ? "text" : "password"}
                  value={securityForm.confirmPassword}
                  onChange={handleSecurityChange}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
    </div>
  );
}
