
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

  const refreshUserData = useCallback(async () => {
    if (!user?.id) {
      console.log("[useUserDataRefresh] Không có user ID, bỏ qua refresh");
      return null;
    }

    if (isRefreshing) {
      console.log("[useUserDataRefresh] Đang refresh, bỏ qua yêu cầu trùng lặp");
      return null;
    }

    try {
      setIsRefreshing(true);
      console.log("[useUserDataRefresh] Đang refresh dữ liệu người dùng cho:", user.id);

      // Xóa cache người dùng nếu có
      try {
        sessionStorage.removeItem(`user_details_${user.id}`);
        console.log(`[useUserDataRefresh] Đã xóa cache cho user ID: ${user.id}`);
      } catch (err) {
        console.warn(`[useUserDataRefresh] Lỗi khi xóa cache:`, err);
      }

      // Lấy thông tin chi tiết từ bảng users với timeout để tránh treo vô hạn
      const getUserPromise = supabase
        .from('users')
        .select('credits, email_verified, subscription, role')
        .eq('id', user.id)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout khi lấy thông tin người dùng")), 5000)
      );
      
      // Sử dụng Promise.race để áp dụng timeout cho yêu cầu API
      const { data: userData, error: userError } = await Promise.race([
        getUserPromise,
        timeoutPromise
      ]) as any;

      if (userError) {
        console.error("[useUserDataRefresh] Lỗi khi lấy thông tin người dùng:", userError);
        throw new Error(userError.message || "Không thể lấy thông tin người dùng");
      }

      console.log("[useUserDataRefresh] Đã lấy thông tin cơ bản người dùng:", userData);

      // Lấy thông tin gói đăng ký hiện tại với timeout để tránh treo
      const getSubPromise = supabase
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
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();
        
      const subTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout khi lấy thông tin gói đăng ký")), 5000)
      );
      
      // Sử dụng Promise.race để áp dụng timeout cho yêu cầu gói đăng ký
      const { data: subData, error: subError } = await Promise.race([
        getSubPromise,
        subTimeoutPromise
      ]) as any;

      if (subError && subError.code !== 'PGRST116') {
        console.error("[useUserDataRefresh] Lỗi khi lấy thông tin gói đăng ký:", subError);
      } else {
        console.log("[useUserDataRefresh] Đã lấy thông tin gói đăng ký:", subData);
      }

      // Kết hợp thông tin
      const userDetails = {
        ...userData,
        subscription: subData?.subscriptions?.name || userData?.subscription || "Không có",
        subscription_end_date: subData?.end_date,
        subscription_status: subData?.status
      };

      console.log("[useUserDataRefresh] Dữ liệu người dùng đã được cập nhật:", userDetails);

      // Cập nhật context
      if (updateUserDetails) {
        updateUserDetails(userDetails);
        console.log("[useUserDataRefresh] Đã cập nhật context với dữ liệu mới");
      }

      return userDetails;
    } catch (error) {
      console.error("[useUserDataRefresh] Lỗi khi refresh dữ liệu người dùng:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, toast, updateUserDetails, isRefreshing]);

  return { refreshUserData, isRefreshing };
};
