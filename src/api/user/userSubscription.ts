
import { supabase } from "@/integrations/supabase/client";

// Handle subscription changes for a user
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
      .eq("status", 'active')
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

    // Log thông tin để debug
    console.log("Creating subscription with data:", {
      user_id: userId,
      subscription_id: subscriptionId,
      start_date: startDate,
      end_date: endDateStr,
      status: 'active'
    });

    // Mã hóa userId để sử dụng với RLS policies 
    // Đảm bảo userId là UUID hợp lệ để RLS hoạt động đúng
    const { data: newSubscription, error: insertError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        start_date: startDate,
        end_date: endDateStr,
        status: 'active'
      })
      .select();

    if (insertError) {
      console.error(`Lỗi khi tạo gói mới: ${insertError.message}`);
      throw new Error(`Lỗi khi tạo gói mới: ${insertError.message}`);
    }

    console.log("New subscription created:", newSubscription);

    return {
      success: true,
      message: `Đã cập nhật gói đăng ký thành ${subscriptionName}`
    };

  } catch (error) {
    console.error("Lỗi xử lý thay đổi gói đăng ký:", error);
    throw error;
  }
}

// Get subscription options list
export const getSubscriptionOptions = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("name")
      .order('price', { ascending: true });
      
    if (error) {
      console.error("Error fetching subscription options:", error.message);
      return ["Không có", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"];
    }
    
    // Always ensure "Không có" (None) is an option
    const options = data.map(row => row.name);
    if (!options.includes("Không có")) {
      options.unshift("Không có");
    }
    
    console.log("Available subscription options:", options);
    return options;
  } catch (error) {
    console.error("Error processing subscription options:", error);
    return ["Không có", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"];
  }
};
