
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CurrentSubscriptionCard from "./components/CurrentSubscriptionCard";
import SubscriptionPlansGrid from "./components/SubscriptionPlansGrid";
import PaymentHistoryCard from "./components/PaymentHistoryCard";
import { Loader2 } from "lucide-react";
import { fetchSubscriptionPlans, fetchUserSubscription, updateUserSubscription, cancelUserSubscription } from "@/api/subscriptionService";

interface UserSubscription {
  plan: string;
  planId: number | null;
  status: string;
  startDate: string;
  endDate: string;
  price: number;
  usageArticles: number;
  totalArticles: number;
}

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription>({
    plan: "Không có",
    planId: null,
    status: "inactive",
    startDate: "",
    endDate: "",
    price: 0,
    usageArticles: 0,
    totalArticles: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Get the current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("Không tìm thấy người dùng, vui lòng đăng nhập lại");
        
        // Load subscription plans
        const plans = await fetchSubscriptionPlans();
        console.log("Loaded subscription plans:", plans);
        setSubscriptions(plans);
        
        // Load user subscription
        const userSubscription = await fetchUserSubscription(user.id);
        console.log("Loaded user subscription:", userSubscription);
        setCurrentSubscription(userSubscription);
      } catch (error: any) {
        console.error("Error loading subscription data:", error);
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải thông tin gói đăng ký",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handleUpgrade = async (planId: number) => {
    setIsUpdating(true);
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Không tìm thấy người dùng, vui lòng đăng nhập lại");
      
      // Update subscription
      const result = await updateUserSubscription(user.id, planId);
      
      toast({
        title: "Thành công",
        description: result.message
      });
      
      // Refresh user subscription data
      const userSubscription = await fetchUserSubscription(user.id);
      setCurrentSubscription(userSubscription);
    } catch (error: any) {
      console.error("Error upgrading subscription:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi nâng cấp gói đăng ký",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = async () => {
    setIsUpdating(true);
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("Không tìm thấy người dùng, vui lòng đăng nhập lại");
      
      // Cancel subscription
      const result = await cancelUserSubscription(user.id);
      
      toast({
        title: "Đã hủy gói đăng ký",
        description: result.message
      });
      
      // Refresh user subscription data
      const userSubscription = await fetchUserSubscription(user.id);
      setCurrentSubscription(userSubscription);
    } catch (error: any) {
      console.error("Error canceling subscription:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Có lỗi xảy ra khi hủy gói đăng ký",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gói đăng ký</h1>
        <p className="text-gray-500">
          Quản lý gói đăng ký và xem thông tin sử dụng
        </p>
      </div>
      {isUpdating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Đang xử lý...</p>
          </div>
        </div>
      )}
      <CurrentSubscriptionCard
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
