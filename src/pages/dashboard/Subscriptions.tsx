
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CurrentSubscriptionCard from "./components/CurrentSubscriptionCard";
import SubscriptionPlansGrid from "./components/SubscriptionPlansGrid";
import PaymentHistoryCard from "./components/PaymentHistoryCard";

// The old mock for available plans, still needed for current subscription info
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
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<{
    plan: string;
    status: string;
    startDate: string;
    endDate: string;
    usageArticles: number;
    totalArticles: number;
  }>({
    plan: "professional",
    status: "active",
    startDate: "15/04/2023",
    endDate: "15/05/2023",
    usageArticles: 8,
    totalArticles: 30
  });

  const { toast } = useToast();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*');

        if (error) throw error;
        setSubscriptions(data);
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách gói đăng ký",
          variant: "destructive"
        });
      }
    };

    fetchSubscriptions();
  }, [toast]);

  const handleUpgrade = (planId: string) => {
    toast({
      title: `Nâng cấp lên ${planId === "Doanh nghiệp" ? "Gói Doanh nghiệp" : "Gói Chuyên nghiệp"}`,
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
      <CurrentSubscriptionCard
        subscriptionPlans={subscriptionPlans}
        currentSubscription={currentSubscription}
        handleUpgrade={handleUpgrade}
        handleCancel={handleCancel}
      />
      <SubscriptionPlansGrid
        subscriptions={subscriptions}
        currentSubscription={currentSubscription}
        handleUpgrade={handleUpgrade}
      />
      <PaymentHistoryCard />
    </div>
  );
};

export default Subscriptions;
