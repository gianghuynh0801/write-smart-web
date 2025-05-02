
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
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const { user, userDetails } = useAuth();
  const { refreshUserData } = useUserDataRefresh();

  // Hàm làm mới dữ liệu thủ công
  const forceRefresh = useCallback(() => {
    console.log("[useDashboardStats] Đang yêu cầu làm mới dữ liệu thống kê...");
    setRefreshTrigger(prev => prev + 1);
  }, []);

  useEffect(() => {
    // Clear session storage cache khi cần làm mới dữ liệu
    if (refreshTrigger > 0) {
      try {
        // Xóa cache thống kê bảng điều khiển nếu có
        sessionStorage.removeItem('dashboard_stats_cache');
        console.log("[useDashboardStats] Đã xóa cache thống kê bảng điều khiển");
      } catch (err) {
        console.warn("[useDashboardStats] Lỗi khi xóa cache:", err);
      }
    }
  }, [refreshTrigger]);

  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 2;
    
    const fetchStats = async () => {
      if (!isMounted) return;
      
      try {
        setIsLoading(true);
        console.log("[useDashboardStats] Đang tải dữ liệu thống kê...");
        
        // Nếu người dùng chưa đăng nhập, hiển thị dữ liệu mặc định
        if (!user) {
          console.log("[useDashboardStats] Không có người dùng, hiển thị dữ liệu mặc định");
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

        // Đảm bảo dữ liệu người dùng được cập nhật trước khi lấy thông tin
        console.log("[useDashboardStats] Làm mới dữ liệu người dùng...");
        await refreshUserData();
        console.log("[useDashboardStats] Dữ liệu người dùng sau khi làm mới:", userDetails);

        // Lấy số lượng bài viết
        console.log("[useDashboardStats] Đang lấy số lượng bài viết...");
        const { count: articleCount, error: articleError } = await supabase
          .from('articles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        if (articleError) {
          console.error('[useDashboardStats] Lỗi khi lấy số bài viết:', articleError);
        }

        console.log("[useDashboardStats] Số lượng bài viết:", articleCount);

        // Lấy thông tin gói đăng ký
        console.log("[useDashboardStats] Đang lấy thông tin gói đăng ký...");
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
          console.error('[useDashboardStats] Lỗi khi lấy thông tin gói đăng ký:', subscriptionError);
        }

        console.log("[useDashboardStats] Thông tin gói đăng ký:", subscriptionData);

        // Tính số ngày còn lại của gói đăng ký
        const endDate = subscriptionData?.end_date ? new Date(subscriptionData.end_date) : null;
        const daysLeft = endDate ? 
          Math.max(0, Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 
          0;

        // Sử dụng thông tin từ subscriptionData hoặc từ userDetails
        const subscriptionName = subscriptionData?.subscriptions?.name || 
                              userDetails?.subscription || 
                              'Không có';
        
        // Lấy thông tin credits từ bảng users để đảm bảo dữ liệu mới nhất
        console.log("[useDashboardStats] Đang lấy thông tin credits trực tiếp từ bảng users...");
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single();
          
        if (userError) {
          console.error('[useDashboardStats] Lỗi khi lấy thông tin credits:', userError);
        }
        
        console.log("[useDashboardStats] Thông tin credits:", userData?.credits);
        
        // Tạo đối tượng stats với dữ liệu mới nhất
        const updatedStats = {
          articleCount: articleCount || 0,
          credits: userData?.credits ?? userDetails?.credits ?? 0,
          subscription: {
            name: subscriptionName,
            daysLeft: daysLeft
          }
        };
        
        console.log("[useDashboardStats] Cập nhật stats:", updatedStats);
        
        // Lưu vào cache để sử dụng lại nếu cần
        try {
          sessionStorage.setItem('dashboard_stats_cache', JSON.stringify({
            stats: updatedStats,
            timestamp: Date.now()
          }));
        } catch (err) {
          console.warn("[useDashboardStats] Không thể lưu cache:", err);
        }
        
        if (isMounted) {
          setStats(updatedStats);
        }
      } catch (error) {
        console.error('[useDashboardStats] Lỗi khi tải thống kê bảng điều khiển:', error);
        
        if (retryCount < maxRetries) {
          console.log(`[useDashboardStats] Đang thử lại lần ${retryCount + 1}/${maxRetries}...`);
          retryCount++;
          setTimeout(fetchStats, 1000); // Thử lại sau 1 giây
          return;
        }
        
        // Set default stats even when there's an error
        if (isMounted) {
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
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, [toast, user, userDetails, refreshUserData, refreshTrigger]);

  return { stats, isLoading, forceRefresh };
};
