
import { supabase } from "@/integrations/supabase/client";
import { parseUser } from "./userCrud";
import { User } from "@/types/user";

export const addUserCredits = async (id: string | number, amount: number): Promise<User> => {
  const userId = String(id);
  console.log(`[API] Bắt đầu thêm ${amount} tín dụng cho người dùng ${userId}`);

  const { data: currentData, error: getError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (getError) {
    console.error(`[API] Lỗi khi tìm người dùng ${userId}:`, getError);
    throw new Error("Không tìm thấy người dùng");
  }
  if (!currentData) {
    console.error(`[API] Không tìm thấy người dùng ${userId}`);
    throw new Error("Không tìm thấy người dùng");
  }

  console.log(`[API] Số dư tín dụng hiện tại: ${currentData.credits ?? 0}`);
  const newCredits = (currentData.credits ?? 0) + amount;
  
  console.log(`[API] Cập nhật số dư tín dụng mới: ${newCredits}`);
  const { data, error } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error(`[API] Lỗi khi cập nhật tín dụng:`, error);
    throw new Error(error.message);
  }
  if (!data) {
    console.error(`[API] Không có dữ liệu trả về sau khi cập nhật`);
    throw new Error("Không thể cập nhật tín dụng");
  }
  
  // Ghi log giao dịch vào payment_history
  try {
    const { error: logError } = await supabase
      .from("payment_history")
      .insert({
        user_id: userId,
        amount: amount,
        status: "completed",
        description: `Quản trị viên thêm ${amount} tín dụng`
      });
    
    if (logError) {
      console.warn(`[API] Không thể ghi log giao dịch:`, logError);
      // Vẫn tiếp tục vì đã cập nhật tín dụng thành công
    } else {
      console.log(`[API] Đã ghi log giao dịch thành công`);
    }
  } catch (logErr) {
    console.warn(`[API] Lỗi khi ghi log giao dịch:`, logErr);
  }
  
  console.log(`[API] Thêm tín dụng thành công, số dư mới: ${data.credits}`);
  return parseUser(data);
};
