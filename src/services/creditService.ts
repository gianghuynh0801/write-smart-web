
import { supabase } from "@/integrations/supabase/client";

export const getArticleCost = async (): Promise<number> => {
  try {
    console.log("Đang lấy chi phí bài viết...");
    const { data, error } = await supabase
      .from("system_configurations")
      .select("value")
      .eq("key", "article_cost")
      .single();

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
    console.log("Đang kiểm tra số dư tín dụng cho user:", userId);
    
    if (!userId) {
      console.error("Lỗi: userId không được cung cấp");
      throw new Error("Không thể kiểm tra số dư tín dụng: Thiếu thông tin người dùng");
    }
    
    const { data, error } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Lỗi khi kiểm tra số dư tín dụng:", error);
      throw new Error("Không thể kiểm tra số dư tín dụng");
    }

    if (!data) {
      console.error("Không tìm thấy thông tin người dùng");
      throw new Error("Không tìm thấy thông tin tín dụng của người dùng");
    }

    const credits = data.credits ?? 0;
    console.log("Số dư tín dụng hiện tại:", credits);
    return credits;
  } catch (error) {
    console.error("Lỗi không xác định khi kiểm tra số dư tín dụng:", error);
    throw error;
  }
};

export const deductCredits = async (
  userId: string, 
  amount: number,
  description: string
): Promise<boolean> => {
  try {
    console.log(`Bắt đầu trừ ${amount} tín dụng cho user ${userId}, mô tả: ${description}`);
    
    if (!userId) {
      console.error("Lỗi: userId không được cung cấp");
      return false;
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      console.error("Lỗi: Số lượng tín dụng không hợp lệ:", amount);
      return false;
    }
    
    // Phương pháp 1: Sử dụng RPC nếu đã được cấu hình
    try {
      const { data, error } = await supabase.rpc(
        'deduct_user_credits',
        { 
          user_uuid: userId,
          amount: amount,
          action_type: 'create_article',
          description_text: description
        }
      );

      if (error) {
        console.error("Lỗi khi trừ tín dụng qua RPC:", error);
        // Nếu RPC lỗi, thử phương pháp 2
        throw error;
      }

      console.log("Trừ tín dụng thành công qua RPC:", data);
      return true;
    } catch (rpcError) {
      console.warn("RPC không khả dụng, chuyển sang phương pháp thay thế:", rpcError);
      
      // Phương pháp 2: Sử dụng update trực tiếp nếu RPC không khả dụng
      // Đầu tiên lấy số tín dụng hiện tại
      const { data: userData, error: getUserError } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();
      
      if (getUserError) {
        console.error("Lỗi khi lấy thông tin user:", getUserError);
        return false;
      }
      
      const currentCredits = userData?.credits ?? 0;
      const newCredits = Math.max(0, currentCredits - amount);
      
      // Cập nhật số tín dụng mới
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("id", userId);
      
      if (updateError) {
        console.error("Lỗi khi cập nhật tín dụng:", updateError);
        return false;
      }
      
      // Ghi log giao dịch vào payment_history nếu có thể
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
      
      console.log(`Đã trừ thành công ${amount} tín dụng cho user ${userId} bằng phương pháp thay thế`);
      return true;
    }
  } catch (error) {
    console.error("Lỗi không mong đợi khi trừ tín dụng:", error);
    return false;
  }
};
