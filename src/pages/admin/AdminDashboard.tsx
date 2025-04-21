
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Users, CreditCard, Package, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

// Sample data for charts (to be used with actual chart implementation)
// These are just placeholders for now

const AdminDashboard = () => {
  // Sample stats
  const stats = [
    {
      title: "Tổng người dùng",
      value: "1,248",
      change: "+12.5%",
      trend: "up",
      icon: Users
    },
    {
      title: "Doanh thu tháng này",
      value: "48,2M VNĐ",
      change: "+8.2%",
      trend: "up",
      icon: CreditCard
    },
    {
      title: "Bài viết đã tạo",
      value: "15,432",
      change: "+24.3%",
      trend: "up",
      icon: BarChart3
    },
    {
      title: "Gói đăng ký",
      value: "321",
      change: "-1.5%",
      trend: "down",
      icon: Package
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className={`flex items-center mt-1 text-xs ${
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendIcon className="h-3 w-3 mr-1" />
                  <span>{stat.change} so với tháng trước</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="revenue">Doanh thu</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Phát triển người dùng</CardTitle>
              <CardDescription>
                Số lượng người dùng mới đăng ký trong 6 tháng gần nhất
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-500">
                Biểu đồ phát triển người dùng
              </div>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Phân bố gói đăng ký</CardTitle>
                <CardDescription>
                  Tỷ lệ người dùng theo từng gói đăng ký
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-500">
                  Biểu đồ phân bố gói đăng ký
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu</CardTitle>
                <CardDescription>
                  Doanh thu theo tháng (triệu VNĐ)
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-500">
                  Biểu đồ doanh thu
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Người dùng mới</CardTitle>
              <CardDescription>
                Số người dùng mới đăng ký theo tháng
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-500">
                Biểu đồ người dùng mới
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Người dùng gần đây</CardTitle>
                <CardDescription>
                  Danh sách người dùng mới đăng ký gần đây
                </CardDescription>
              </div>
              <Button variant="outline" className="h-8">
                Xem tất cả
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-4 font-medium border-b bg-gray-50">
                  <div>Người dùng</div>
                  <div>Ngày đăng ký</div>
                  <div>Gói</div>
                  <div>Trạng thái</div>
                </div>
                <div className="divide-y">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-4 p-4">
                      <div className="font-medium">Người dùng {i}</div>
                      <div className="text-gray-500">{new Date().toLocaleDateString()}</div>
                      <div>Gói Chuyên nghiệp</div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Hoạt động
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung đã tạo</CardTitle>
              <CardDescription>
                Số lượng bài viết được tạo theo tháng
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-500">
                Biểu đồ nội dung đã tạo
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu</CardTitle>
              <CardDescription>
                Biểu đồ doanh thu theo tháng (triệu VNĐ)
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg text-gray-500">
                Biểu đồ doanh thu theo tháng
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Giao dịch gần đây</CardTitle>
                <CardDescription>
                  Danh sách giao dịch thanh toán gần đây
                </CardDescription>
              </div>
              <Button variant="outline" className="h-8">
                Xem tất cả
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-4 p-4 font-medium border-b bg-gray-50">
                  <div>Giao dịch</div>
                  <div>Người dùng</div>
                  <div>Số tiền</div>
                  <div>Ngày</div>
                </div>
                <div className="divide-y">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="grid grid-cols-4 p-4">
                      <div className="font-medium">GD-{1000 + i}</div>
                      <div className="text-gray-500">Người dùng {i}</div>
                      <div>499.000đ</div>
                      <div>{new Date().toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
