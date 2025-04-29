
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { fetchSubscriptionPlans, fetchUserSubscription, updateUserSubscription, cancelUserSubscription } from "@/api/subscription";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDataRefresh } from "@/hooks/useUserDataRefresh";

export const useSubscription = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState({
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
  const { user, userDetails } = useAuth();
  const { refreshUserData } = useUserDataRefresh();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          throw new Error("Không tìm thấy người dùng, vui lòng đăng nhập lại");
        }
        
        const plans = await fetchSubscriptionPlans();
        console.log("Loaded subscription plans:", plans);
        setSubscriptions(plans);
        
        // Kiểm tra xem có thông tin từ userDetails không
        if (userDetails?.subscription) {
          console.log("Using subscription info from userDetails:", userDetails.subscription);
        }
        
        const userSubscription = await fetchUserSubscription(user.id);
        console.log("Loaded user subscription:", userSubscription);
        setCurrentSubscription(userSubscription);
        
        // Refresh dữ liệu người dùng để đảm bảo AuthContext có thông tin mới nhất
        await refreshUserData();
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
  }, [toast, user, userDetails, refreshUserData]);

  const handleUpgrade = async (planId: number) => {
    setIsUpdating(true);
    try {
      if (!user) throw new Error("Không tìm thấy người dùng, vui lòng đăng nhập lại");
      
      const result = await updateUserSubscription(user.id, planId);
      
      toast({
        title: "Thành công",
        description: result.message
      });
      
      // Cập nhật lại thông tin gói đăng ký
      const userSubscription = await fetchUserSubscription(user.id);
      setCurrentSubscription(userSubscription);
      
      // Refresh dữ liệu người dùng trong context
      await refreshUserData();
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
      if (!user) throw new Error("Không tìm thấy người dùng, vui lòng đăng nhập lại");
      
      const result = await cancelUserSubscription(user.id);
      
      toast({
        title: "Đã hủy gói đăng ký",
        description: result.message
      });
      
      // Cập nhật lại thông tin gói đăng ký
      const userSubscription = await fetchUserSubscription(user.id);
      setCurrentSubscription(userSubscription);
      
      // Refresh dữ liệu người dùng trong context
      await refreshUserData();
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

  return {
    subscriptions,
    currentSubscription,
    isLoading,
    isUpdating,
    handleUpgrade,
    handleCancel
  };
};
