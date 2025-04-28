
import { supabase } from "@/integrations/supabase/client";
import { parseUser } from "./userParser";
import { User, UserFormValues } from "@/types/user";
import { createUserSubscriptionAsAdmin } from "./admin/subscriptionOperations";
import { handleSubscriptionChange } from "./userSubscription";
import { getUserById } from "./userQueries";

export const createUser = async (userData: UserFormValues): Promise<User> => {
  const newId = crypto.randomUUID();
  
  console.log("[createUser] Tạo user mới với dữ liệu:", userData);
  
  const { data, error } = await supabase.from("users").insert([
    {
      id: newId,
      name: userData.name,
      email: userData.email,
      credits: userData.credits,
      status: userData.status,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      role: userData.role
    }
  ]).select().maybeSingle();

  if (error) {
    console.error("[createUser] Lỗi khi tạo user:", error);
    throw new Error(error.message);
  }
  
  if (!data) {
    console.error("[createUser] Không thể tạo user:", userData);
    throw new Error("Không thể tạo người dùng mới");
  }
  
  const createdUser = parseUser(data);

  if (
    userData.subscription &&
    userData.subscription !== "Không có" &&
    userData.subscription !== "Cơ bản"
  ) {
    try {
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("name", userData.subscription)
        .maybeSingle();
      
      if (subscriptionData) {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        const endDateStr = endDate.toISOString().split('T')[0];
        
        await createUserSubscriptionAsAdmin(
          newId,
          subscriptionData.id,
          startDate,
          endDateStr
        );
      }
    } catch (subError) {
      console.error("[createUser] Lỗi khi cập nhật gói đăng ký:", subError);
      throw new Error(`Không thể tạo gói đăng ký: ${subError instanceof Error ? subError.message : String(subError)}`);
    }
  }

  createdUser.subscription = userData.subscription;
  return createdUser;
};

export const updateUser = async (id: string | number, userData: UserFormValues): Promise<User> => {
  const userId = String(id);
  
  console.log("[updateUser] Cập nhật user:", { userId, userData });
  
  // Kiểm tra user tồn tại
  const currentUser = await getUserById(userId);
  if (!currentUser) {
    console.error("[updateUser] Không tìm thấy user:", userId);
    throw new Error("Không tìm thấy người dùng cần cập nhật");
  }
  
  const { data, error } = await supabase
    .from("users")
    .update({
      name: userData.name,
      email: userData.email,
      credits: userData.credits,
      status: userData.status,
      role: userData.role
    })
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) {
    console.error("[updateUser] Lỗi khi cập nhật user:", error);
    throw new Error(error.message);
  }
  
  if (!data) {
    console.error("[updateUser] Không tìm thấy user sau khi cập nhật:", userId);
    throw new Error("Không tìm thấy người dùng sau khi cập nhật");
  }
  
  const updatedUser = parseUser(data);
  
  // Cập nhật gói đăng ký nếu có thay đổi
  if (currentUser.subscription !== userData.subscription) {
    try {
      console.log("[updateUser] Cập nhật gói đăng ký từ", currentUser.subscription, "thành", userData.subscription);
      const result = await handleSubscriptionChange(userId, userData.subscription);
      
      if (!result.success) {
        console.error("[updateUser] Lỗi khi thay đổi gói đăng ký:", result.message);
      }
    } catch (error) {
      console.error("[updateUser] Lỗi khi cập nhật gói đăng ký:", error);
    }
  }

  updatedUser.subscription = userData.subscription;
  return updatedUser;
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const userId = String(id);
  console.log("[deleteUser] Xóa user:", userId);
  
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) {
    console.error("[deleteUser] Lỗi khi xóa user:", error);
    throw new Error(error.message);
  }
};
