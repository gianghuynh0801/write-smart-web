
import { supabase } from "@/integrations/supabase/client";
import { parseUser } from "./userCrud";
import { User } from "@/types/user";

export const addUserCredits = async (id: string | number, amount: number): Promise<User> => {
  const userId = String(id);

  const { data: currentData, error: getError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (getError) throw new Error("Không tìm thấy người dùng");
  if (!currentData) throw new Error("Không tìm thấy người dùng");

  const newCredits = (currentData.credits ?? 0) + amount;
  const { data, error } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Không thể cập nhật credits");
  return parseUser(data);
};
