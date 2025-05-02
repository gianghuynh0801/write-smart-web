
import { useEffect, useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { useUserDataRefresh } from "@/hooks/useUserDataRefresh";

interface DashboardStats {
  articleCount: number;
  credits: number;
  subscription: {
    name: string;
    daysLeft: number;
  };
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, userDetails } = useAuth();
  const { refreshUserData, isRefreshing: isUserDataRefreshing } = useUserDataRefresh();

  // Hàm lấy dữ liệu dashboard
  const fetchStats = useCallback(async (forceRefresh = false) => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Nếu người dùng chưa đăng nhập, hiển thị dữ liệu mặc định
      if (!user) {
        setStats({
          articleCount: 0,
          credits: 0,
          subscription: {
            name: 'Không có',
            daysLeft: 0
          }
        });
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // Đảm bảo dữ liệu người dùng được cập nhật trước
      let currentUserDetails = userDetails;
      if (forceRefresh || !currentUserDetails?.credits) {
        console.log("useDashboardStats: Yêu cầu làm mới dữ liệu người dùng");
        const result = await refreshUserData();
        if (result.success && result.data) {
          currentUserDetails = result.data;
        }
      }

      // Tạo timeout promise để tránh bị treo
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout khi lấy số lượng bài viết")), 8000);
      });

      // Lấy số lượng bài viết với timeout
      const articlePromise = supabase
        .from('articles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const articleResult = await Promise.race([articlePromise, timeoutPromise]) as any;
      const { count: articleCount, error: articleError } = articleResult;

      if (articleError) {
        console.error('Lỗi khi lấy số lượng bài viết:', articleError);
        setError("Không thể lấy thông tin bài viết");
      }

      // Lấy thông tin gói đăng ký nếu chưa có hoặc yêu cầu làm mới
      let subscriptionName = currentUserDetails?.subscription || 'Không có';
      let daysLeft = 0;
      
      if (forceRefresh || !currentUserDetails?.subscription_end_date) {
        // Lấy thông tin gói đăng ký
        const subPromise = supabase
          .from('user_subscriptions')
          .select(`
            subscription_id,
            end_date,
            subscriptions (
              name
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();
          
        const subResult = await Promise.race([subPromise, timeoutPromise]) as any;
        const { data: subscriptionData, error: subscriptionError } = subResult;

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Lỗi khi lấy thông tin gói đăng ký:', subscriptionError);
        } else if (subscriptionData) {
          subscriptionName = subscriptionData.subscriptions?.name || subscriptionName;
          
          // Tính số ngày còn lại của gói đăng ký
          const endDate = subscriptionData.end_date ? new Date(subscriptionData.end_date) : null;
          daysLeft = endDate ? 
            Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 
            0;
        }
      } else if (currentUserDetails?.subscription_end_date) {
        // Tính số ngày còn lại từ dữ liệu hiện có
        const endDate = new Date(currentUserDetails.subscription_end_date);
        daysLeft = Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
      }

      setStats({
        articleCount: articleCount || 0,
        credits: currentUserDetails?.credits || 0,
        subscription: {
          name: subscriptionName,
          daysLeft: daysLeft
        }
      });
      
      console.log("useDashboardStats: Dữ liệu đã được cập nhật", {
        articles: articleCount || 0,
        credits: currentUserDetails?.credits || 0,
        subscription: subscriptionName,
        daysLeft
      });
      
    } catch (error) {
      console.error('Lỗi khi lấy thống kê dashboard:', error);
      setError("Không thể tải thông tin bảng điều khiển");
      
      // Đặt giá trị mặc định khi có lỗi
      setStats({
        articleCount: 0,
        credits: userDetails?.credits || 0,
        subscription: {
          name: userDetails?.subscription || 'Không có',
          daysLeft: 0
        }
      });
      
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin bảng điều khiển. Vui lòng thử lại sau.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast, user, userDetails, refreshUserData]);

  // Effect để tải dữ liệu khi component được mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { 
    stats, 
    isLoading: isLoading || isUserDataRefreshing, 
    isRefreshing: isRefreshing || isUserDataRefreshing,
    error,
    refreshStats: (forceRefresh = true) => fetchStats(forceRefresh)
  };
};
