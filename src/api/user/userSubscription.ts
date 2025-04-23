
import { supabase } from "@/integrations/supabase/client";

// Hàm xử lý việc thay đổi gói đăng ký cho user
export async function handleSubscriptionChange(userId: string, subscriptionName: string) {
  try {
    const { data: subscriptionData } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("name", subscriptionName)
      .maybeSingle();

    if (!subscriptionData) {
      console.log(`Không tìm thấy gói đăng ký có tên: ${subscriptionName}`);
      return;
    }

    const subscriptionId = subscriptionData.id;

    const { data: existingSubscription } = await supabase
      .from("user_subscriptions")
      .select("id, status")
      .eq("user_id", userId)
      .order("id", { ascending: false })
      .maybeSingle();

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    const endDateStr = endDate.toISOString().split('T')[0];

    if (existingSubscription) {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("id", existingSubscription.id);

      if (error) {
        console.error(`Lỗi khi hủy gói cũ: ${error.message}`);
      }
    }

    try {
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          subscription_id: subscriptionId,
          start_date: startDate,
          end_date: endDateStr,
          status: 'active'
        });

      if (insertError) {
        console.error(`Lỗi khi tạo gói mới: ${insertError.message}`);
      }
    } catch (insertCatchError) {
      console.error(`Lỗi exception khi tạo gói mới: ${insertCatchError}`);
    }
  } catch (error) {
    console.error("Lỗi xử lý thay đổi gói đăng ký:", error);
  }
}

// Lấy DS options gói đăng ký
export const getSubscriptionOptions = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("subscriptions").select("name");
  if (error || !data) {
    return ["Không có", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"];
  }
  return data.map(row => row.name);
};
