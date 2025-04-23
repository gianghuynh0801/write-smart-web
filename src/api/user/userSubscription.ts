
import { supabase } from "@/integrations/supabase/client";
import { createUserSubscriptionAsAdmin } from "./adminOperations";

// Handle subscription changes for a user
export async function handleSubscriptionChange(userId: string, subscriptionName: string) {
  try {
    // Get subscription info from name
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

    // Calculate subscription dates
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
    const endDateStr = endDate.toISOString().split('T')[0];

    // Use admin operations to bypass RLS
    await createUserSubscriptionAsAdmin(userId, subscriptionId, startDate, endDateStr);

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
