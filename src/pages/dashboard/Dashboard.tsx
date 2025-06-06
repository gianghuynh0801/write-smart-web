
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CreditCard, Package, ArrowUpRight, Link, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link as RouterLink } from "react-router-dom";
import { useDashboardStats } from "./hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { useUserDataRefresh } from "@/hooks/useUserDataRefresh";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { stats, isLoading, isRefreshing, error, refreshStats } = useDashboardStats();
  const { refreshUserData, isRefreshing: isUserRefreshing } = useUserDataRefresh();
  const { toast } = useToast();
  
  // Refresh dữ liệu người dùng khi trang dashboard được tải
  useEffect(() => {
    const initData = async () => {
      console.log("Dashboard mounted, refreshing user data...");
      const result = await refreshUserData();
      if (!result.success) {
        console.log("Failed to refresh user data on mount");
      }
    };
    
    initData();
  }, [refreshUserData]);

  // Xử lý sự kiện khi người dùng nhấn nút làm mới
  const handleRefresh = async () => {
    console.log("Manual refresh requested");
    try {
      const userResult = await refreshUserData(true);
      if (userResult.success) {
        await refreshStats(true);
      }
    } catch (err) {
      console.error("Lỗi khi làm mới dữ liệu:", err);
      toast({
        title: "Lỗi",
        description: "Không thể làm mới dữ liệu. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    }
  };

  const renderStats = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-[60px] mb-1" />
            <Skeleton className="h-4 w-[80px]" />
          </CardContent>
        </Card>
      ));
    }

    const statItems = [
      {
        name: "Bài viết đã tạo",
        value: stats?.articleCount.toString() || "0",
        icon: FileText,
        change: "",
        link: "/dashboard/articles"
      },
      {
        name: "Tín dụng còn lại",
        value: stats?.credits.toString() || "0",
        icon: CreditCard,
        change: "",
        link: "/dashboard/credits"
      },
      {
        name: "Gói subscription",
        value: stats?.subscription?.name || "Không có",
        icon: Package,
        change: stats?.subscription?.daysLeft ? `${stats.subscription.daysLeft} ngày còn lại` : "",
        link: "/dashboard/subscriptions"
      }
    ];

    return statItems.map((stat) => {
      const Icon = stat.icon;
      return (
        <Card key={stat.name}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              {stat.name}
            </CardTitle>
            <Icon className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            {stat.change && (
              <p className="text-xs text-gray-500 mt-1">
                {stat.change}
              </p>
            )}
            <div className="mt-4">
              <RouterLink to={stat.link}>
                <Button variant="outline" size="sm" className="w-full">
                  Xem chi tiết
                  <ArrowUpRight className="ml-2 h-3 w-3" />
                </Button>
              </RouterLink>
            </div>
          </CardContent>
        </Card>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bảng điều khiển</h1>
          <p className="text-gray-500">
            Chào mừng bạn đến với WriteSmart, xem thống kê và tạo nội dung của bạn tại đây.
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing || isUserRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${(isRefreshing || isUserRefreshing) ? 'animate-spin' : ''}`} />
          {(isRefreshing || isUserRefreshing) ? 'Đang cập nhật...' : 'Làm mới dữ liệu'}
        </Button>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {renderStats()}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Bài viết gần đây</CardTitle>
            <CardDescription>
              Các bài viết bạn đã tạo gần đây
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">Bài viết về SEO #{i}</p>
                    <p className="text-sm text-gray-500">Tạo lúc: {new Date().toLocaleDateString()}</p>
                  </div>
                  <RouterLink to={`/dashboard/articles/${i}`}>
                    <Button variant="ghost" size="sm">Xem</Button>
                  </RouterLink>
                </div>
              ))}
              {[1, 2, 3].length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Bạn chưa tạo bài viết nào.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Khởi động nhanh</CardTitle>
            <CardDescription>
              Tạo nội dung hoặc quản lý tài khoản của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RouterLink to="/dashboard/create">
              <Button className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Tạo bài viết mới
              </Button>
            </RouterLink>
            <RouterLink to="/dashboard/connections">
              <Button variant="outline" className="w-full">
                <Link className="mr-2 h-4 w-4" />
                Kết nối tài khoản mạng xã hội
              </Button>
            </RouterLink>
            <RouterLink to="/dashboard/credits">
              <Button variant="outline" className="w-full">
                <CreditCard className="mr-2 h-4 w-4" />
                Mua thêm tín dụng
              </Button>
            </RouterLink>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
