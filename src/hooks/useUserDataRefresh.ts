
import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook để refresh dữ liệu người dùng (tín dụng và gói đăng ký)
 */
export const useUserDataRefresh = () => {
  const { toast } = useToast();
  const { user, updateUserDetails } = useAuth();

  const refreshUserData = useCallback(async () => {
    if (!user?.id) {
      console.log("useUserDataRefresh: Không có user ID, bỏ qua refresh");
      return null;
    }

    try {
      console.log("useUserDataRefresh: Đang refresh dữ liệu người dùng cho:", user.id);

      // Lấy thông tin chi tiết từ bảng users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('credits, email_verified, subscription')
        .eq('id', user.id)
        .single();

      if (userError) {
        console.error("Lỗi khi lấy thông tin người dùng:", userError);
        return null;
      }

      console.log("useUserDataRefresh: Đã lấy thông tin cơ bản người dùng:", userData);

      // Lấy thông tin gói đăng ký hiện tại
      const { data: subData, error: subError } = await supabase
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
        subscription_status: subData?.status
      };

      console.log("Dữ liệu người dùng đã được cập nhật:", userDetails);

      // Cập nhật context
      if (updateUserDetails) {
        updateUserDetails(userDetails);
        console.log("useUserDataRefresh: Đã cập nhật context với dữ liệu mới");
      }

      return userDetails;
    } catch (error) {
      console.error("Lỗi khi refresh dữ liệu người dùng:", error);
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông tin người dùng. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return null;
    }
  }, [user?.id, toast, updateUserDetails]);

  return { refreshUserData };
};
