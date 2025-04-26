
import { supabase } from "@/integrations/supabase/client";
import { createUserSubscriptionAsAdmin } from "./adminOperations";

// Handle subscription changes for a user
export async function handleSubscriptionChange(userId: string, subscriptionName: string) {
  try {
    console.log("Xử lý thay đổi gói đăng ký cho người dùng:", userId, "thành:", subscriptionName);
    
    // Luôn hủy các gói đăng ký hiện tại trước khi thêm gói mới
    try {
      console.log("Hủy tất cả gói đăng ký đang hoạt động cho người dùng:", userId);
      await createUserSubscriptionAsAdmin(userId, -1, '', '', 'inactive');
    } catch (deactivateErr) {
      console.error(`Lỗi khi hủy gói đăng ký hiện tại: ${deactivateErr}`);
      throw new Error(`Không thể hủy gói đăng ký hiện tại: ${deactivateErr instanceof Error ? deactivateErr.message : 'Lỗi không xác định'}`);
    }
    
    // Nếu người dùng chọn "Không có" thì chỉ cần hủy các gói đang hoạt động
    if (subscriptionName === "Không có") {
      console.log("Người dùng đã chọn không sử dụng gói đăng ký nào");
      return {
        success: true,
        message: "Đã hủy tất cả gói đăng ký"
      };
    }
    
    // Lấy thông tin gói đăng ký từ tên
    console.log("Đang tìm thông tin gói đăng ký:", subscriptionName);
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("name", subscriptionName)
      .maybeSingle();

    if (subscriptionError) {
      console.error(`Lỗi khi tìm gói đăng ký: ${subscriptionError.message}`);
      throw new Error(`Không tìm thấy thông tin gói đăng ký: ${subscriptionError.message}`);
    }

    if (!subscriptionData) {
      console.error(`Không tìm thấy gói đăng ký có tên: ${subscriptionName}`);
      throw new Error(`Không tìm thấy gói đăng ký có tên: ${subscriptionName}`);
    }

    console.log("Đã tìm thấy thông tin gói đăng ký:", subscriptionData);
    const subscriptionId = subscriptionData.id;

    // Tính toán ngày bắt đầu và kết thúc gói đăng ký
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // Gói 1 tháng
    const endDateStr = endDate.toISOString().split('T')[0];

    console.log("Tạo gói đăng ký mới với thông tin:", { 
      userId,
      subscriptionId,
      startDate, 
      endDateStr 
    });

    // Tạo gói đăng ký mới với quyền admin để bypass RLS
    await createUserSubscriptionAsAdmin(
      userId, 
      subscriptionId, 
      startDate, 
      endDateStr, 
      'active'
    );

    console.log("Đã hoàn thành việc cập nhật gói đăng ký thành:", subscriptionName);
    
    return {
      success: true,
      message: `Đã cập nhật gói đăng ký thành ${subscriptionName}`
    };

  } catch (error) {
    console.error("Lỗi xử lý thay đổi gói đăng ký:", error);
    return {
      success: false,
      message: `Không thể cập nhật gói đăng ký: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`
    };
  }
}

// Get subscription options list
export const getSubscriptionOptions = async (): Promise<string[]> => {
  try {
    console.log("Đang lấy danh sách gói đăng ký...");
    const { data, error } = await supabase
      .from("subscriptions")
      .select("name")
      .order('price', { ascending: true });
      
    if (error) {
      console.error("Lỗi khi lấy danh sách gói đăng ký:", error.message);
      // Trả về các giá trị mặc định nếu không thể truy vấn từ database
      return ["Không có", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"];
    }
    
    // Luôn đảm bảo "Không có" (None) là một tùy chọn
    const options = data ? data.map(row => row.name) : [];
    if (!options.includes("Không có")) {
      options.unshift("Không có");
    }
    
    console.log("Các gói đăng ký có sẵn:", options);
    return options;
  } catch (error) {
    console.error("Lỗi khi xử lý danh sách gói đăng ký:", error);
    return ["Không có", "Cơ bản", "Chuyên nghiệp", "Doanh nghiệp"];
  }
};
