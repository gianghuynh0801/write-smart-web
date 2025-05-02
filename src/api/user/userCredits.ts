
import { db } from "@/integrations/supabase/typeSafeClient";
import { parseUser } from "./userParser";
import { User } from "@/types/user";

export const addUserCredits = async (id: string | number, amount: number): Promise<User> => {
  const userId = String(id);
  console.log(`[API] Bắt đầu thêm ${amount} tín dụng cho người dùng ${userId}`);

  const { data: currentData, error: getError } = await db.users()
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

  // Xử lý an toàn với credits - kiểm tra null/undefined
  const currentCredits = (currentData && typeof currentData === 'object' && 'credits' in currentData) ? 
    Number((currentData as any).credits) : 0;
    
  console.log(`[API] Số dư tín dụng hiện tại: ${currentCredits}`);
  const newCredits = currentCredits + amount;
  
  console.log(`[API] Cập nhật số dư tín dụng mới: ${newCredits}`);
  const { data, error } = await db.users()
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
    const { error: logError } = await db.payment_history()
      .insert({
        user_id: userId,
        amount: amount,
        status: "completed",
        description: `Quản trị viên thêm ${amount} tín dụng`,
        payment_at: new Date().toISOString() // Thêm trường payment_at bắt buộc
      });
    
    if (logError) {
      console.warn(`[API] Không thể ghi log giao dịch:`, logError);
    } else {
      console.log(`[API] Đã ghi log giao dịch thành công`);
    }
  } catch (logErr) {
    console.warn(`[API] Lỗi khi ghi log giao dịch:`, logErr);
  }
  
  // Xử lý an toàn với credits khi trả về - kiểm tra null/undefined
  const credits = (data && typeof data === 'object' && 'credits' in data) ? 
    Number((data as any).credits) : 0;
    
  console.log(`[API] Thêm tín dụng thành công, số dư mới: ${credits}`);
  return parseUser(data);
};
