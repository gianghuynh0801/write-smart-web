// Re-export APIs đã chia nhỏ để codebase backward compatibility
export * from "./user/userCredits";
export * from "./user/userSubscription";

import { supabase } from "@/integrations/supabase/client";
import { User, UserFormValues } from "@/types/user";
import { createUserSubscriptionAsAdmin, getUserActiveSubscription } from "./adminOperations";
import { handleSubscriptionChange } from "./userSubscription";

// Hàm chuyển đổi dữ liệu từ database thành đối tượng User
export function parseUser(row: any): User {
  return {
    id: row.id,
    name: row.name || "",
    email: row.email || "",
    credits: row.credits ?? 0,
    subscription: row.subscription ?? "Không có",
    status: row.status === "inactive" ? "inactive" : "active",
    registeredAt: row.created_at ? new Date(row.created_at).toISOString().split("T")[0] : "",
    avatar: row.avatar || `https://i.pravatar.cc/150?u=${row.id}`,
    role: row.role === "admin" || row.role === "editor" ? row.role : "user",
    email_verified: !!row.email_verified
  };
}

export const fetchUsers = async (
  page = 1,
  pageSize = 5,
  status: string = "all",
  searchTerm: string = ""
): Promise<{ data: User[]; total: number }> => {
  try {
    console.log("Đang lấy danh sách người dùng với các thông số:", { page, pageSize, status, searchTerm });

    // Lấy token JWT của người dùng hiện tại
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.access_token) {
      throw new Error("Không có phiên đăng nhập hợp lệ");
    }

    // Gọi Edge Function để lấy danh sách người dùng với quyền admin
    const response = await supabase.functions.invoke('admin-users', {
      body: {
        page,
        pageSize,
        status,
        searchTerm
      },
      headers: {
        Authorization: `Bearer ${session.access_token}`
      }
    });

    if (response.error) {
      throw new Error(`Lỗi API: ${response.error.message}`);
    }

    if (!response.data) {
      return {
        data: [],
        total: 0
      };
    }

    const { data: users, total } = response.data;
    
    console.log(`Đã lấy được ${users?.length || 0} người dùng, tổng số: ${total || 0}`);
    
    return {
      data: users || [],
      total: total || 0
    };
  } catch (error) {
    console.error("Lỗi không mong muốn khi lấy danh sách users:", error);
    throw error;
  }
};

export const getUserById = async (id: string | number): Promise<User | undefined> => {
  const userId = String(id);
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  
  if (error) throw new Error("Không tìm thấy người dùng");
  if (!data) return undefined;
  
  // Get current subscription
  const userWithSubscription = parseUser(data);
  
  try {
    const subscriptionData = await getUserActiveSubscription(userId);
    if (subscriptionData && subscriptionData.subscriptions) {
      userWithSubscription.subscription = subscriptionData.subscriptions.name;
    }
  } catch (subError) {
    console.error("Lỗi khi lấy thông tin gói đăng ký:", subError);
    // Tiếp tục sử dụng dữ liệu người dùng mà không có thông tin gói đăng ký
  }
  
  return userWithSubscription;
};

export const createUser = async (userData: UserFormValues): Promise<User> => {
  const newId = crypto.randomUUID();
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
  ]).select().single();

  if (error) throw new Error(error.message);
  
  const createdUser = parseUser(data);

  // [NOTE!] The trigger handle_new_user_subscription() automatically creates a default subscription for every user.
  // Only create a user_subscriptions record IF the admin selects a different package than the default (e.g., "Không có" meaning no subscription, or a package other than default).
  if (
    userData.subscription &&
    userData.subscription !== "Không có" &&
    userData.subscription !== "Cơ bản"
  ) {
    try {
      // Get subscription info by name
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("name", userData.subscription)
        .maybeSingle();
      
      if (subscriptionData) {
        // Calculate subscription dates
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
        const endDateStr = endDate.toISOString().split('T')[0];
        
        await createUserSubscriptionAsAdmin(
          newId,
          subscriptionData.id,
          startDate,
          endDateStr
        );
      }
    } catch (subError) {
      console.error("Could not update subscription info:", subError);
      throw new Error(`Could not create subscription: ${subError instanceof Error ? subError.message : String(subError)}`);
    }
  }

  createdUser.subscription = userData.subscription; // Update subscription field in return object
  return createdUser;
};

export const updateUser = async (id: string | number, userData: UserFormValues): Promise<User> => {
  const userId = String(id);
  
  // Get current user data for comparison
  const currentUser = await getUserById(userId);
  
  // Update basic user information
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
    .single();

  if (error) throw new Error(error.message);
  
  const updatedUser = parseUser(data);
  
  // Check if subscription has changed and update if needed
  if (currentUser && currentUser.subscription !== userData.subscription) {
    try {
      // Sử dụng hàm riêng để xử lý thay đổi gói đăng ký
      const result = await handleSubscriptionChange(userId, userData.subscription);
      
      if (!result.success) {
        console.error("Lỗi khi thay đổi gói đăng ký:", result.message);
        // Vẫn tiếp tục vì không muốn toàn bộ quá trình cập nhật bị lỗi
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
      // Vẫn tiếp tục vì không muốn toàn bộ quá trình cập nhật bị lỗi
    }
  }

  updatedUser.subscription = userData.subscription;
  return updatedUser;
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const userId = String(id);
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw new Error(error.message);
};
