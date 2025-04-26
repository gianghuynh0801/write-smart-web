
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
    throw new Error("Không thể kiểm tra số dư credit");
  }

  return data?.credits ?? 0;
};

export const deductCredits = async (
  userId: string, 
  amount: number,
  description: string
): Promise<boolean> => {
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
    console.error("Lỗi khi trừ credit:", error);
    return false;
  }

  return data;
};
