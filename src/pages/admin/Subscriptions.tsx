
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package } from "lucide-react";

const AdminSubscriptions = () => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <Package className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Gói đăng ký</CardTitle>
            <CardDescription>Quản lý các gói đăng ký của người dùng</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gray-50 rounded-md text-center">
            <p className="text-primary mb-2 font-medium">Chức năng quản lý gói đăng ký cho admin đang phát triển.</p>
            <span className="text-gray-500 text-sm">Vui lòng quay lại sau để biết thêm thông tin.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSubscriptions;
