
import { supabase } from "@/integrations/supabase/client";
import { parseUser } from "./userParser";
import { User } from "@/types/user";
import { getUserActiveSubscription } from "./admin/subscriptionOperations";

export const fetchUsers = async (
  page = 1,
  pageSize = 5,
  status: string = "all",
  searchTerm: string = ""
): Promise<{ data: User[]; total: number }> => {
  try {
    console.log("Đang lấy danh sách người dùng với các thông số:", { page, pageSize, status, searchTerm });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.access_token) {
      throw new Error("Không có phiên đăng nhập hợp lệ");
    }

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
  
  const userWithSubscription = parseUser(data);
  
  try {
    const subscriptionData = await getUserActiveSubscription(userId);
    if (subscriptionData && subscriptionData.subscriptions) {
      userWithSubscription.subscription = subscriptionData.subscriptions.name;
    }
  } catch (subError) {
    console.error("Lỗi khi lấy thông tin gói đăng ký:", subError);
  }
  
  return userWithSubscription;
};
