
import { supabase } from "@/integrations/supabase/client";

export const createUserSubscriptionAsAdmin = async (
  userId: string, 
  subscriptionId: number, 
  startDate: string,
  endDate: string
): Promise<boolean> => {
  try {
    // Đảm bảo trạng thái các gói đăng ký hiện tại là inactive
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({ status: "inactive" })
      .eq("user_id", userId)
      .eq("status", "active");
      
    if (updateError) {
      console.error("Lỗi khi cập nhật gói đăng ký cũ:", updateError.message);
      // Vẫn tiếp tục để tạo gói mới
    }
    
    // Tạo gói mới
    const { error: insertError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      });
      
    if (insertError) {
      console.error("Lỗi khi tạo gói đăng ký mới:", insertError.message);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý:", error);
    return false;
  }
};

export const getUserActiveSubscription = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        start_date,
        end_date,
        status,
        subscriptions:subscription_id (
          id,
          name
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .single();
      
    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Lỗi khi lấy thông tin gói đăng ký:", error.message);
      }
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý:", error);
    return null;
  }
};
