
import { useCallback, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth';

/**
 * Hook để refresh dữ liệu người dùng (tín dụng và gói đăng ký)
 */
export const useUserDataRefresh = () => {
  const { toast } = useToast();
  const { user, updateUserDetails } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshUserData = useCallback(async (showToast = false) => {
    if (!user?.id) {
      console.log("useUserDataRefresh: Không có user ID, bỏ qua refresh");
      return { success: false, data: null };
    }

    try {
      setIsRefreshing(true);
      console.log("useUserDataRefresh: Đang refresh dữ liệu người dùng cho:", user.id);

      // Tạo timeout promise để tránh bị treo
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Timeout khi lấy thông tin người dùng")), 8000);
      });

      // Lấy thông tin chi tiết từ bảng users
      const userPromise = supabase
        .from('users')
        .select('credits, email_verified, subscription')
        .eq('id', user.id as any)
        .single();
        
      // Sử dụng Promise.race để áp dụng timeout
      const userResult = await Promise.race([userPromise, timeoutPromise]) as any;
      const { data: userData, error: userError } = userResult;

      if (userError) {
        console.error("Lỗi khi lấy thông tin người dùng:", userError);
        
        if (showToast) {
          toast({
            title: "Lỗi",
            description: "Không thể lấy thông tin người dùng. Vui lòng thử lại sau.",
            variant: "destructive",
          });
        }
        
        return { success: false, data: null };
      }

      console.log("useUserDataRefresh: Đã lấy thông tin cơ bản người dùng:", userData);

      // Lấy thông tin gói đăng ký hiện tại với timeout
      const subPromise = supabase
        .from('user_subscriptions')
        .select(`
          subscription_id,
          end_date,
          status,
          subscriptions (
            name,
            features
          )
        `)
        .eq('user_id', user.id as any)
        .eq('status', 'active' as any)
        .maybeSingle();
        
      const subResult = await Promise.race([subPromise, timeoutPromise]) as any;
      const { data: subData, error: subError } = subResult;

      if (subError && subError.code !== 'PGRST116') {
        console.error("Lỗi khi lấy thông tin gói đăng ký:", subError);
      } else {
        console.log("useUserDataRefresh: Đã lấy thông tin gói đăng ký:", subData);
      }

      // Kết hợp thông tin
      const userDetails = {
        ...userData,
        subscription: subData?.subscriptions?.name || userData?.subscription || "Không có",
        subscription_end_date: subData?.end_date,
        subscription_status: subData?.status,
        refreshed_at: new Date().toISOString() // Thêm timestamp để biết khi nào dữ liệu được cập nhật
      };

      console.log("Dữ liệu người dùng đã được cập nhật:", userDetails);

      // Cập nhật context
      if (updateUserDetails) {
        updateUserDetails(userDetails);
        console.log("useUserDataRefresh: Đã cập nhật context với dữ liệu mới");
      }
      
      // Hiển thị thông báo thành công nếu yêu cầu
      if (showToast) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin người dùng",
        });
      }

      return { success: true, data: userDetails };
    } catch (error) {
      console.error("Lỗi khi refresh dữ liệu người dùng:", error);
      
      if (showToast) {
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.",
          variant: "destructive",
        });
      }
      
      return { success: false, data: null };
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, toast, updateUserDetails]);

  return { refreshUserData, isRefreshing };
};
