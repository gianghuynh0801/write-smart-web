
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CreditCard, Calendar } from "lucide-react";
import React from "react";

type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
};

interface CurrentSubscriptionCardProps {
  subscriptionPlans: Plan[];
  currentSubscription: {
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    usageArticles: number;
    totalArticles: number;
  };
  handleUpgrade: (planId: string) => void;
  handleCancel: () => void;
}

const CurrentSubscriptionCard: React.FC<CurrentSubscriptionCardProps> = ({
  subscriptionPlans,
  currentSubscription,
  handleUpgrade,
  handleCancel
}) => {
  const planObj = subscriptionPlans.find(p => p.id === currentSubscription.plan);

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
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Đang hoạt động
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">
              {planObj?.name}
            </h3>
            <p className="text-sm text-gray-500">
              {planObj?.description}
            </p>
            <div className="mt-2 flex items-center text-sm">
              <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
              <span>{planObj?.price}đ/{planObj?.period}</span>
            </div>
            <div className="mt-1 flex items-center text-sm">
              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
              <span>Gia hạn vào ngày {currentSubscription.endDate}</span>
            </div>
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button variant="outline" onClick={handleCancel}>
              Hủy gói
            </Button>
            {currentSubscription.plan !== "enterprise" && (
              <Button onClick={() => handleUpgrade("enterprise")}>
                Nâng cấp
              </Button>
            )}
          </div>
        </div>
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
      </CardContent>
    </Card>
  );
};

export default CurrentSubscriptionCard;
