
import { supabase } from "@/integrations/supabase/client";
import { createUserSubscriptionAsAdmin } from "./adminOperations";
import { Subscription } from "@/types/subscriptions";

// Handle subscription changes for a user
export async function handleSubscriptionChange(userId: string, subscriptionName: string) {
  try {
    console.log("Handling subscription change for user:", userId, "to:", subscriptionName);
    
    if (subscriptionName === "Không có") {
      // Logic xử lý khi người dùng không còn gói đăng ký
      console.log("Removing all active subscriptions for user:", userId);
      
      // Deactivate existing subscriptions using admin client to bypass RLS
      try {
        const { error: deactivateError } = await supabase.rpc('deactivate_user_subscriptions', { user_id_param: userId });
        
        if (deactivateError) {
          // Try with admin operations if RPC fails
          console.log("Failed to use RPC function, trying direct admin operation:", deactivateError.message);
          await createUserSubscriptionAsAdmin(userId, -1, '', '', 'inactive');
        }
      } catch (deactivateErr) {
        console.error(`Error deactivating subscriptions: ${deactivateErr}`);
        // Try direct database update as fallback
        await createUserSubscriptionAsAdmin(userId, -1, '', '', 'inactive');
      }
      
      return {
        success: true,
        message: "Đã hủy tất cả gói đăng ký"
      };
    }
    
    // Get subscription info from name
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("name", subscriptionName)
      .maybeSingle();

    if (subscriptionError) {
      console.error(`Lỗi khi tìm gói đăng ký: ${subscriptionError.message}`);
      
      // Xử lý giả lập khi gặp lỗi hoặc không có môi trường Supabase thực tế
      console.log("Sử dụng dữ liệu giả lập cho subscription");
      
      const mockSubscriptionId = {
        "Không có": -1,
        "Cơ bản": 1,
        "Chuyên nghiệp": 2, 
        "Doanh nghiệp": 3
      }[subscriptionName] || 1;
      
      // Calculate subscription dates
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
      const endDateStr = endDate.toISOString().split('T')[0];

      console.log("Creating mock subscription with dates:", { startDate, endDateStr, mockSubscriptionId });
      
      // Thực hiện tạo subscription thật với admin client
      try {
        await createUserSubscriptionAsAdmin(userId, mockSubscriptionId, startDate, endDateStr, 'active');
        return {
          success: true,
          message: `Đã cập nhật gói đăng ký thành ${subscriptionName}`
        };
      } catch (adminError) {
        console.error("Không thể tạo subscription thật:", adminError);
        // Return error message
        return {
          success: false,
          message: `Không thể cập nhật gói đăng ký: ${adminError instanceof Error ? adminError.message : 'Lỗi không xác định'}`
        };
      }
    }

    if (!subscriptionData) {
      console.error(`Không tìm thấy gói đăng ký có tên: ${subscriptionName}`);
      throw new Error(`Không tìm thấy gói đăng ký có tên: ${subscriptionName}`);
    }

    console.log("Found subscription data:", subscriptionData);
    const subscriptionId = subscriptionData.id;

    // Calculate subscription dates
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log("Creating subscription with dates:", { startDate, endDateStr });

    // Use admin operations to bypass RLS
    await createUserSubscriptionAsAdmin(userId, subscriptionId, startDate, endDateStr, 'active');

    return {
      success: true,
      message: `Đã cập nhật gói đăng ký thành ${subscriptionName}`
    };

  } catch (error) {
    console.error("Lỗi xử lý thay đổi gói đăng ký:", error);
    // Trả về thông báo lỗi nhưng không làm gián đoạn luồng ứng dụng
    return {
      success: false,
      message: `Không thể cập nhật gói đăng ký: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`
    };
  }
}

// Get subscription options list
export const getSubscriptionOptions = async (): Promise<string[]> => {
  try {
    console.log("Fetching subscription options...");
    const { data, error } = await supabase
      .from("subscriptions")
      .select("name")
      .order('price', { ascending: true });
      
    if (error) {
      console.error("Error fetching subscription options:", error.message);
      // Trả về các giá trị mặc định nếu không thể truy vấn từ database
      return ["Không có", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"];
    }
    
    // Always ensure "Không có" (None) is an option
    const options = data ? data.map(row => row.name) : [];
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
