
import { supabase } from "@/integrations/supabase/client";

export const getArticleCost = async (): Promise<number> => {
  const { data, error } = await supabase
    .from("system_configurations")
    .select("value")
    .eq("key", "article_cost")
    .single();

  if (error) {
    console.error("Lỗi khi lấy giá bài viết:", error);
    return 1; // Giá mặc định nếu không lấy được
  }

  return parseInt(data?.value || "1");
};

export const checkUserCredits = async (userId: string): Promise<number> => {
  const { data, error } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Lỗi khi kiểm tra số dư credit:", error);
    throw new Error("Không thể kiểm tra số dư credit");
  }

  return data?.credits ?? 0;
};

export const deductCredits = async (
  userId: string, 
  amount: number,
  description: string
): Promise<boolean> => {
  try {
    console.log(`Bắt đầu trừ ${amount} credit cho user ${userId}, mô tả: ${description}`);
    
    // Phương pháp 1: Sử dụng RPC nếu đã được cấu hình
    try {
      const { data, error } = await supabase.rpc(
        'deduct_user_credits' as any,
        { 
          user_uuid: userId,
          amount: amount,
          action_type: 'create_article',
          description_text: description
        }
      );

      if (error) {
        console.error("Lỗi khi trừ credit qua RPC:", error);
        // Nếu RPC lỗi, thử phương pháp 2
        throw error;
      }

      console.log("Trừ credit thành công qua RPC:", data);
      return true;
    } catch (rpcError) {
      console.warn("RPC không khả dụng, chuyển sang phương pháp thay thế:", rpcError);
      
      // Phương pháp 2: Sử dụng update trực tiếp nếu RPC không khả dụng
      // Đầu tiên lấy số credit hiện tại
      const { data: userData, error: getUserError } = await supabase
        .from("users")
        .select("credits")
        .eq("id", userId)
        .single();
      
      if (getUserError) {
        console.error("Lỗi khi lấy thông tin user:", getUserError);
        return false;
      }
      
      const currentCredits = userData?.credits || 0;
      const newCredits = Math.max(0, currentCredits - amount);
      
      // Cập nhật số credit mới
      const { error: updateError } = await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("id", userId);
      
      if (updateError) {
        console.error("Lỗi khi cập nhật credit:", updateError);
        return false;
      }
      
      // Ghi log giao dịch vào payment_history nếu có thể
      try {
        const { error: logError } = await supabase
          .from("payment_history")
          .insert({
            user_id: userId,
            amount: -amount, // Số âm để thể hiện việc trừ credit
            description: description,
            status: "completed"
          });
          
        if (logError) {
          console.warn("Không thể ghi log giao dịch:", logError);
          // Vẫn tiếp tục vì đã trừ credit thành công
        }
      } catch (logErr) {
        console.warn("Lỗi khi ghi log giao dịch:", logErr);
        // Vẫn coi là thành công vì đã trừ credit
      }
      
      console.log(`Đã trừ thành công ${amount} credit cho user ${userId} bằng phương pháp thay thế`);
      return true;
    }
  } catch (error) {
    console.error("Lỗi không mong đợi khi trừ credit:", error);
    return false;
  }
};

