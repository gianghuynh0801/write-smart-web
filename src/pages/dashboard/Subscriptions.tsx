
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Check, Package, AlertTriangle, CreditCard, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const subscriptionPlans = [
  {
    id: "basic",
    name: "Gói Cơ bản",
    price: "199.000",
    period: "tháng",
    description: "Dành cho người mới bắt đầu",
    features: [
      "10 bài viết mỗi tháng",
      "Tối đa 1.000 từ mỗi bài",
      "Tối ưu SEO cơ bản",
      "Kết nối 1 tài khoản WordPress",
      "Hỗ trợ qua email"
    ]
  },
  {
    id: "professional",
    name: "Gói Chuyên nghiệp",
    price: "499.000",
    period: "tháng",
    description: "Dành cho doanh nghiệp nhỏ",
    features: [
      "30 bài viết mỗi tháng",
      "Tối đa 2.000 từ mỗi bài",
      "Tối ưu SEO nâng cao",
      "Kết nối 3 tài khoản mạng xã hội",
      "Phân tích nội dung",
      "Hỗ trợ ưu tiên"
    ],
    popular: true
  },
  {
    id: "enterprise",
    name: "Gói Doanh nghiệp",
    price: "999.000",
    period: "tháng",
    description: "Dành cho doanh nghiệp lớn",
    features: [
      "100 bài viết mỗi tháng",
      "Không giới hạn số từ",
      "Tối ưu SEO cao cấp",
      "Kết nối không giới hạn",
      "Phân tích nội dung chi tiết",
      "Hỗ trợ 24/7",
      "API tích hợp"
    ]
  }
];

const Subscriptions = () => {
  // Giả lập trạng thái gói đăng ký hiện tại
  const [currentSubscription] = useState({
    plan: "professional",
    status: "active",
    startDate: "15/04/2023",
    endDate: "15/05/2023",
    usageArticles: 8,
    totalArticles: 30
  });
  
  const { toast } = useToast();
  
  const handleUpgrade = (planId: string) => {
    // Trong ứng dụng thực tế, sẽ chuyển hướng đến trang thanh toán
    toast({
      title: `Nâng cấp lên ${planId === "enterprise" ? "Gói Doanh nghiệp" : "Gói Chuyên nghiệp"}`,
      description: "Đang chuyển hướng đến trang thanh toán..."
    });
  };
  
  const handleCancel = () => {
    toast({
      title: "Hủy gói đăng ký",
      description: "Gói đăng ký của bạn sẽ còn hiệu lực đến ngày kết thúc hiện tại."
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gói đăng ký</h1>
        <p className="text-gray-500">
          Quản lý gói đăng ký và xem thông tin sử dụng
        </p>
      </div>
      
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
                {subscriptionPlans.find(p => p.id === currentSubscription.plan)?.name}
              </h3>
              <p className="text-sm text-gray-500">
                {subscriptionPlans.find(p => p.id === currentSubscription.plan)?.description}
              </p>
              <div className="mt-2 flex items-center text-sm">
                <CreditCard className="h-4 w-4 mr-1 text-gray-400" />
                <span>{subscriptionPlans.find(p => p.id === currentSubscription.plan)?.price}đ/{subscriptionPlans.find(p => p.id === currentSubscription.plan)?.period}</span>
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
            {currentSubscription.usageArticles / currentSubscription.totalArticles > 0.8 && (
              <div className="flex items-start mt-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                <span>Bạn đã sử dụng hơn 80% số bài viết hàng tháng. Cân nhắc nâng cấp để có thêm bài viết.</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <h2 className="text-xl font-medium">Tất cả gói đăng ký</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {subscriptionPlans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative overflow-hidden cursor-pointer transition-all ${
                currentSubscription.plan === plan.id 
                  ? 'ring-2 ring-primary' 
                  : 'hover:shadow-md'
              } ${plan.popular ? 'shadow-md' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs py-1 px-3 rounded-bl-lg">
                  Phổ biến
                </div>
              )}
              {currentSubscription.plan === plan.id && (
                <div className="absolute top-0 right-0 bg-green-600 text-white text-xs py-1 px-3 rounded-bl-lg">
                  Gói hiện tại
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="mb-4">
                  <span className="text-2xl font-bold">{plan.price}đ</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check size={16} className="text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {currentSubscription.plan === plan.id ? (
                  <div className="w-full p-2 bg-green-50 text-green-700 font-medium rounded-md text-center">
                    Gói hiện tại
                  </div>
                ) : (
                  <Button
                    variant={plan.id === "enterprise" ? "default" : "outline"}
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                  >
                    {currentSubscription.plan === "enterprise" 
                      ? "Hạ cấp xuống gói này" 
                      : plan.id === "enterprise" 
                        ? "Nâng cấp lên gói này"
                        : "Chuyển sang gói này"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thanh toán</CardTitle>
          <CardDescription>
            Lịch sử các giao dịch thanh toán gói đăng ký của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-4 p-4 font-medium border-b bg-gray-50">
              <div>Hóa đơn</div>
              <div>Ngày</div>
              <div>Số tiền</div>
              <div>Trạng thái</div>
            </div>
            <div className="divide-y">
              {[
                { id: "INV-001", date: "15/04/2023", amount: "499.000đ", status: "Thành công" },
                { id: "INV-002", date: "15/03/2023", amount: "499.000đ", status: "Thành công" },
                { id: "INV-003", date: "15/02/2023", amount: "499.000đ", status: "Thành công" }
              ].map((invoice, i) => (
                <div key={i} className="grid grid-cols-4 p-4">
                  <div className="font-medium">{invoice.id}</div>
                  <div className="text-gray-500">{invoice.date}</div>
                  <div>{invoice.amount}</div>
                  <div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {invoice.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full md:w-auto">
            <Package className="mr-2 h-4 w-4" />
            Xem tất cả hóa đơn
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Subscriptions;
