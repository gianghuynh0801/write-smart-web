
import { supabase } from "@/integrations/supabase/client";

export const getArticleCost = async (): Promise<number> => {
  try {
    console.log("Đang lấy chi phí bài viết...");
    const { data, error } = await supabase
      .from("system_configurations")
      .select("value")
      .eq("key", "article_cost")
      .maybeSingle();

    if (error) {
      console.error("Lỗi khi lấy giá bài viết:", error);
      return 1; // Giá mặc định nếu không lấy được
    }

    if (!data || !data.value) {
      console.log("Không tìm thấy cấu hình chi phí bài viết, sử dụng giá mặc định: 1");
      return 1;
    }

    const cost = parseInt(data.value);
    console.log("Chi phí bài viết:", cost);
    return cost;
  } catch (error) {
    console.error("Lỗi không xác định khi lấy chi phí bài viết:", error);
    return 1; // Giá mặc định nếu xảy ra lỗi
  }
};

export const checkUserCredits = async (userId: string): Promise<number> => {
  try {
    console.log("=== Bắt đầu kiểm tra số dư tín dụng ===");
    console.log("userId:", userId);
    
    if (!userId) {
      console.error("Lỗi: userId không được cung cấp");
      throw new Error("Không thể kiểm tra số dư: Thiếu thông tin người dùng");
    }
    
    // Kiểm tra thông tin người dùng trong bảng users
    console.log("Đang kiểm tra thông tin người dùng từ bảng users...");
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, credits, name, email")
      .eq("id", userId)
      .maybeSingle();
    
    if (userError) {
      console.error("Lỗi khi truy vấn thông tin người dùng:", userError);
      throw new Error(`Không thể kiểm tra số dư tín dụng: ${userError.message}`);
    }

    // Nếu không tìm thấy người dùng
    if (!userData) {
      console.error(`Không tìm thấy người dùng với ID: ${userId} trong bảng users`);
      
      // Kiểm tra xem ID có tồn tại trong auth.users không
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error("Lỗi khi kiểm tra auth.users:", authError);
        throw new Error("Không thể xác thực người dùng hiện tại");
      }
      
      if (!authUser) {
        console.error("Người dùng chưa đăng nhập");
        throw new Error("Bạn cần đăng nhập để sử dụng tính năng này");
      }
      
      if (userId !== authUser.id) {
        console.error("ID người dùng không khớp với session:", userId, authUser.id);
        throw new Error("Phiên làm việc không hợp lệ, vui lòng đăng nhập lại");
      }
      
      console.error("Người dùng đã xác thực nhưng không tìm thấy trong bảng users");
      throw new Error("Tài khoản chưa được khởi tạo đầy đủ trong hệ thống");
    }
    
    const credits = userData.credits ?? 0;
    console.log("Số dư tín dụng của người dùng:", credits);
    return credits;
    
  } catch (error) {
    console.error("Lỗi khi kiểm tra số dư tín dụng:", error);
    throw error;
  }
};

export const deductCredits = async (
  userId: string, 
  amount: number,
  description: string
): Promise<boolean> => {
  try {
    console.log("=== Bắt đầu trừ tín dụng ===");
    console.log("userId:", userId);
    console.log("Số tín dụng cần trừ:", amount);
    console.log("Mô tả giao dịch:", description);
    
    if (!userId) {
      console.error("Lỗi: userId không được cung cấp");
      return false;
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      console.error("Lỗi: Số lượng tín dụng không hợp lệ:", amount);
      return false;
    }
    
    // Đầu tiên lấy số tín dụng hiện tại
    const { data: userData, error: getUserError } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .maybeSingle();
    
    if (getUserError) {
      console.error("Lỗi khi lấy thông tin user:", getUserError);
      return false;
    }

    if (!userData) {
      console.error("Không tìm thấy thông tin user cho userId:", userId);
      return false;
    }
    
    const currentCredits = userData.credits ?? 0;
    if (currentCredits < amount) {
      console.error(`Số dư không đủ: Hiện tại=${currentCredits}, Cần=${amount}`);
      return false;
    }

    const newCredits = Math.max(0, currentCredits - amount);
    
    console.log(`Trừ tín dụng: Hiện tại=${currentCredits}, Trừ=${amount}, Còn lại=${newCredits}`);
    
    // Cập nhật số tín dụng mới
    const { error: updateError } = await supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("id", userId);
    
    if (updateError) {
      console.error("Lỗi khi cập nhật tín dụng:", updateError);
      return false;
    }
    
    // Ghi log giao dịch vào payment_history
    try {
      const { error: logError } = await supabase
        .from("payment_history")
        .insert({
          user_id: userId,
          amount: -amount, // Số âm để thể hiện việc trừ tín dụng
          description: description,
          status: "completed"
        });
        
      if (logError) {
        console.warn("Không thể ghi log giao dịch:", logError);
        // Vẫn tiếp tục vì đã trừ tín dụng thành công
      }
    } catch (logErr) {
      console.warn("Lỗi khi ghi log giao dịch:", logErr);
      // Vẫn coi là thành công vì đã trừ tín dụng
    }
    
    console.log(`=== Đã trừ thành công ${amount} tín dụng cho user ${userId} ===`);
    return true;
  } catch (error) {
    console.error("Lỗi không mong đợi khi trừ tín dụng:", error);
    return false;
  }
};
