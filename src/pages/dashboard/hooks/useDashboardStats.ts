import { useEffect, useState } from "react";
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
  const { toast } = useToast();
  const { user, userDetails } = useAuth();
  const { refreshUserData } = useUserDataRefresh();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        
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
          return;
        }

        // Đảm bảo dữ liệu người dùng được cập nhật
        if (!userDetails?.credits) {
          await refreshUserData();
        }

        // Lấy số lượng bài viết
        const { count: articleCount, error: articleError } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (articleError) {
          console.error('Error fetching articles:', articleError);
        }

        // Lấy thông tin gói đăng ký
        const { data: subscriptionData, error: subscriptionError } = await supabase
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

        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Error fetching subscription data:', subscriptionError);
        }

        // Tính số ngày còn lại của gói đăng ký
        const endDate = subscriptionData?.end_date ? new Date(subscriptionData.end_date) : null;
        const daysLeft = endDate ? 
          Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 
          0;

        // Sử dụng thông tin từ subscriptionData hoặc từ userDetails
        const subscriptionName = subscriptionData?.subscriptions?.name || 
                              userDetails?.subscription || 
                              'Không có';
        
        setStats({
          articleCount: articleCount || 0,
          credits: userDetails?.credits || 0,
          subscription: {
            name: subscriptionName,
            daysLeft: daysLeft
          }
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        
        // Set default stats even when there's an error
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
      }
    };

    fetchStats();
  }, [toast, user, userDetails, refreshUserData]);

  return { stats, isLoading };
};
