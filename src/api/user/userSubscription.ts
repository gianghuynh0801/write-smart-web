
import { supabase } from "@/integrations/supabase/client";

// Hàm xử lý việc thay đổi gói đăng ký cho user
export async function handleSubscriptionChange(userId: string, subscriptionName: string) {
  try {
    // Lấy thông tin gói đăng ký từ tên
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("name", subscriptionName)
      .maybeSingle();

    if (subscriptionError) {
      console.error(`Lỗi khi tìm gói đăng ký: ${subscriptionError.message}`);
      throw new Error(`Không thể tìm thấy gói đăng ký: ${subscriptionError.message}`);
    }

    if (!subscriptionData) {
      console.error(`Không tìm thấy gói đăng ký có tên: ${subscriptionName}`);
      throw new Error(`Không tìm thấy gói đăng ký có tên: ${subscriptionName}`);
    }

    const subscriptionId = subscriptionData.id;

    // Kiểm tra gói đăng ký hiện tại của người dùng
    const { data: existingSubscription, error: existingError } = await supabase
      .from("user_subscriptions")
      .select("id, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("id", { ascending: false })
      .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error(`Lỗi khi kiểm tra gói đăng ký hiện tại: ${existingError.message}`);
      throw new Error(`Lỗi khi kiểm tra gói đăng ký hiện tại: ${existingError.message}`);
    }

    // Tính toán thời gian bắt đầu và kết thúc gói
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Gói 1 tháng
    const endDateStr = endDate.toISOString().split('T')[0];

    // Nếu người dùng đã có gói, đánh dấu là không hoạt động
    if (existingSubscription) {
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("id", existingSubscription.id);

      if (updateError) {
        console.error(`Lỗi khi hủy gói cũ: ${updateError.message}`);
        throw new Error(`Lỗi khi hủy gói cũ: ${updateError.message}`);
      }
    }

    // Tạo gói mới cho người dùng
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
      throw new Error(`Lỗi khi tạo gói mới: ${insertError.message}`);
    }

    // Cập nhật lại thông tin gói trong bảng users
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ subscription: subscriptionName })
      .eq("id", userId);

    if (userUpdateError) {
      console.error(`Lỗi khi cập nhật thông tin gói cho user: ${userUpdateError.message}`);
      // Không throw error ở đây, vẫn để quá trình hoàn tất vì gói đã được tạo
    }

    return {
      success: true,
      message: `Đã cập nhật gói đăng ký thành ${subscriptionName}`
    };

  } catch (error) {
    console.error("Lỗi xử lý thay đổi gói đăng ký:", error);
    throw error;
  }
}

// Lấy DS options gói đăng ký
export const getSubscriptionOptions = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("subscriptions").select("name");
  if (error || !data) {
    console.error("Lỗi khi lấy danh sách gói đăng ký:", error);
    return ["Không có", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"];
  }
  return data.map(row => row.name);
};
