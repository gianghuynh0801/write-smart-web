
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CreditCard, Calendar } from "lucide-react";
import React from "react";

interface CurrentSubscriptionCardProps {
  currentSubscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    price: number;
    usageArticles: number;
    totalArticles: number;
  };
  handleUpgrade: (planId: number) => void;
  handleCancel: () => void;
}

const CurrentSubscriptionCard: React.FC<CurrentSubscriptionCardProps> = ({
  currentSubscription,
  handleUpgrade,
  handleCancel
}) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Miễn phí";
    return price.toLocaleString() + 'đ';
  };

  const getStatusBadge = () => {
    switch (currentSubscription.status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Đang hoạt động
          </Badge>
        );
      case 'canceled':
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            Đã hủy (Còn hiệu lực)
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            Không hoạt động
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gói đăng ký hiện tại</CardTitle>
            <CardDescription>
              Chi tiết về gói đăng ký và trạng thái của bạn
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">
              {currentSubscription.plan}
            </h3>
            {currentSubscription.price > 0 && (
              <div className="mt-2 flex items-center text-sm">
                <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                <span>{formatPrice(currentSubscription.price)}/tháng</span>
              </div>
            )}
            {currentSubscription.endDate && (
              <div className="mt-1 flex items-center text-sm">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                <span>
                  {currentSubscription.status === 'canceled' 
                    ? `Hiệu lực đến ${formatDate(currentSubscription.endDate)}`
                    : `Gia hạn vào ngày ${formatDate(currentSubscription.endDate)}`
                  }
                </span>
              </div>
            )}
          </div>
          {currentSubscription.status === 'active' && (
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button variant="outline" onClick={handleCancel}>
                Hủy gói
              </Button>
              {currentSubscription.plan !== "Doanh nghiệp" && (
                <Button onClick={() => handleUpgrade(4)}>
                  Nâng cấp
                </Button>
              )}
            </div>
          )}
          {currentSubscription.status === 'inactive' && (
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button onClick={() => handleUpgrade(2)}>
                Đăng ký gói
              </Button>
            </div>
          )}
        </div>
        {currentSubscription.totalArticles > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Sử dụng hàng tháng ({currentSubscription.usageArticles}/{currentSubscription.totalArticles} bài viết)</span>
              <span className="font-medium">{Math.round((currentSubscription.usageArticles / currentSubscription.totalArticles) * 100)}%</span>
            </div>
            <Progress value={Math.round((currentSubscription.usageArticles / currentSubscription.totalArticles) * 100)} />
            {(currentSubscription.usageArticles / currentSubscription.totalArticles > 0.8) && (
              <div className="flex items-start mt-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>Bạn đã sử dụng hơn 80% số bài viết hàng tháng. Cân nhắc nâng cấp để có thêm bài viết.</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrentSubscriptionCard;
