
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { credit-card } from "lucide-react";

const AdminCredits = () => {
  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <credit-card className="h-6 w-6 text-primary" />
          <div>
            <CardTitle>Tín dụng</CardTitle>
            <CardDescription>Quản lý tín dụng và giao dịch trong hệ thống</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-gray-50 rounded-md text-center">
            <p className="text-primary mb-2 font-medium">Chức năng quản lý tín dụng cho admin đang phát triển.</p>
            <span className="text-gray-500 text-sm">Vui lòng quay lại sau để biết thêm thông tin.</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCredits;
