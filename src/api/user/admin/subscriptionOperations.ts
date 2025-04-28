
import { supabase } from "@/integrations/supabase/client";
import { UserSubscription } from "@/types/subscriptions";

export const createUserSubscriptionAsAdmin = async (
  userId: string, 
  subscriptionId: number, 
  startDate: string,
  endDate: string,
  status: string = 'active'
): Promise<boolean> => {
  try {
    console.log("Thực hiện thao tác gói đăng ký:", { userId, subscriptionId, startDate, endDate, status });
    
    if (!userId) {
      throw new Error("ID người dùng không được để trống");
    }
    
    const client = getAdminClient();
    
    if (status === 'inactive') {
      console.log("Đang hủy tất cả gói đăng ký hiện tại của người dùng:", userId);
      
      const { error: updateError } = await client
        .from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("user_id", userId)
        .eq("status", "active");
        
      if (updateError) {
        console.error("Lỗi khi hủy gói đăng ký hiện tại:", updateError.message);
        throw new Error(`Không thể hủy gói đăng ký hiện tại: ${updateError.message}`);
      }
      
      console.log("Đã hủy thành công tất cả gói đăng ký hiện tại");
      
      if (subscriptionId === -1 || !startDate || !endDate) {
        console.log("Không tạo gói đăng ký mới, chỉ hủy gói hiện tại");
        return true;
      }
    }
    
    if (status === 'active') {
      if (subscriptionId <= 0) {
        throw new Error("ID gói đăng ký không hợp lệ");
      }
      
      if (!startDate || !endDate) {
        throw new Error("Ngày bắt đầu và kết thúc là bắt buộc");
      }
      
      const { data: subscriptionExists, error: checkError } = await client
        .from("subscriptions")
        .select("id")
        .eq("id", subscriptionId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Lỗi khi kiểm tra gói đăng ký:", checkError.message);
        throw new Error(`Không thể kiểm tra gói đăng ký: ${checkError.message}`);
      }
      
      if (!subscriptionExists) {
        console.error("Gói đăng ký không tồn tại trong hệ thống:", subscriptionId);
        throw new Error(`Gói đăng ký ID=${subscriptionId} không tồn tại trong hệ thống`);
      }
      
      const { error: updateError } = await client
        .from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("user_id", userId)
        .eq("status", "active");
        
      if (updateError) {
        console.error("Lỗi khi cập nhật gói đăng ký cũ:", updateError.message);
        throw new Error(`Không thể hủy gói đăng ký cũ: ${updateError.message}`);
      }
      
      console.log("Đang tạo gói đăng ký mới:", { userId, subscriptionId, startDate, endDate, status });
      
      const { error: insertError } = await client
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          subscription_id: subscriptionId,
          start_date: startDate,
          end_date: endDate,
          status: status
        });
        
      if (insertError) {
        console.error("Lỗi khi tạo gói đăng ký mới:", insertError.message);
        throw new Error(`Không thể tạo gói đăng ký mới: ${insertError.message}`);
      }
      
      console.log("Đã tạo gói đăng ký mới thành công");
    }
    
    return true;
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý gói đăng ký:", error);
    throw error;
  }
};

export const getUserActiveSubscription = async (userId: string) => {
  try {
    console.log("Đang lấy thông tin gói đăng ký hiện tại cho người dùng:", userId);
    
    const client = getAdminClient();

    const { data, error } = await client
      .from("user_subscriptions")
      .select(`
        id,
        start_date,
        end_date,
        status,
        user_id,
        subscription_id,
        subscriptions:subscription_id (
          id,
          name
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
      
    if (error) {
      if (error.code !== 'PGRST116') {
        console.error("Lỗi khi lấy thông tin gói đăng ký:", error.message);
      }
      return null;
    }
    
    if (data) {
      const subscription: UserSubscription = {
        id: data.id,
        user_id: data.user_id,
        subscription_id: data.subscription_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        subscriptions: data.subscriptions ? {
          id: (data.subscriptions as any).id,
          name: (data.subscriptions as any).name,
          description: null,
          price: 0,
          period: '',
          features: null
        } : undefined
      };
      
      return subscription;
    }
    
    return null;
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý:", error);
    return null;
  }
};

// Helper function to get admin client
const getAdminClient = () => {
  console.log("Sử dụng client Supabase hiện có thay vì tạo client admin mới");
  return supabase;
};

