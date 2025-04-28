
import { supabase } from "@/integrations/supabase/client";
import { supabaseAdmin } from "@/integrations/supabase/adminClient";
import { parseUser } from "./userParser";
import { User, UserFormValues } from "@/types/user";
import { createUserSubscriptionAsAdmin } from "./admin/subscriptionOperations";
import { handleSubscriptionChange } from "./userSubscription";
import { getUserById } from "./userQueries";
import { getItem, setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

// Function để đợi một khoảng thời gian
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createUser = async (userData: UserFormValues): Promise<User> => {
  const newId = crypto.randomUUID();
  
  console.log("[createUser] Tạo user mới với dữ liệu:", userData);
  
  // Sử dụng admin client để đảm bảo có thể bypass RLS
  const { data, error } = await supabaseAdmin.from("users").insert([
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

// Hàm trợ giúp để lấy và làm mới token admin khi cần
const getAdminToken = async (): Promise<string | null> => {
  try {
    // Kiểm tra session hiện tại
    const { data: { session }, error: sessionError } = await supabaseAdmin.auth.getSession();
    
    if (sessionError) {
      console.error("[getAdminToken] Lỗi khi lấy session:", sessionError);
      return null;
    }
    
    if (session?.access_token) {
      console.log("[getAdminToken] Đã tìm thấy session token hợp lệ");
      return session.access_token;
    }

    console.log("[getAdminToken] Không tìm thấy token, thử lấy từ local storage");
    
    // Nếu không có session, kiểm tra trong local storage
    const adminToken = getItem<string>(LOCAL_STORAGE_KEYS.SESSION_TOKEN, false);
    if (adminToken) {
      console.log("[getAdminToken] Đã tìm thấy token trong local storage");
      return adminToken;
    }
    
    console.log("[getAdminToken] Không tìm thấy token hợp lệ");
    return null;
  } catch (error) {
    console.error("[getAdminToken] Lỗi khi lấy token admin:", error);
    return null;
  }
};

export const updateUser = async (id: string | number, userData: UserFormValues): Promise<User> => {
  const userId = String(id);
  
  console.log("[updateUser] Chuẩn bị cập nhật user:", { userId, userData });
  
  try {
    // Lấy token admin
    const adminToken = await getAdminToken();
    
    if (!adminToken) {
      console.error("[updateUser] Không tìm thấy token admin");
      throw new Error("Không có phiên đăng nhập hợp lệ, vui lòng đăng nhập lại");
    }
    
    console.log("[updateUser] Gọi Edge Function với token");
    
    // Gọi Edge Function với token xác thực
    const { data: responseData, error: invocationError } = await supabaseAdmin.functions.invoke(
      'update-user',
      {
        body: { id: userId, userData },
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    if (invocationError) {
      console.error("[updateUser] Lỗi khi gọi Edge Function:", invocationError);
      throw new Error(`Lỗi cập nhật: ${invocationError.message}`);
    }
    
    // Kiểm tra phản hồi từ Edge Function
    if (!responseData) {
      console.error("[updateUser] Edge Function không trả về dữ liệu");
      throw new Error("Không nhận được dữ liệu từ máy chủ");
    }
    
    console.log("[updateUser] Phản hồi từ Edge Function:", responseData);
    
    if (responseData.error) {
      console.error("[updateUser] Edge Function trả về lỗi:", responseData.error);
      
      // Xử lý lỗi xác thực đặc biệt
      if (responseData.error.includes('xác thực') || responseData.error.includes('phiên đăng nhập') || 
          responseData.error.includes('401') || responseData.error.includes('403')) {
        
        // Thử làm mới phiên đăng nhập
        console.log("[updateUser] Phát hiện lỗi xác thực, thử làm mới phiên đăng nhập");
        
        // Lưu token trong localStorage để sử dụng lại sau khi đăng nhập
        const { data: { session } } = await supabaseAdmin.auth.getSession();
        if (session) {
          setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
        }
      }
      
      throw new Error(`Lỗi cập nhật: ${responseData.error}`);
    }
    
    if (!responseData.data) {
      console.error("[updateUser] Edge Function không trả về dữ liệu user:", responseData);
      throw new Error("Dữ liệu người dùng không hợp lệ");
    }

    // Phân tích và trả về dữ liệu người dùng đã cập nhật
    return parseUser(responseData.data);
  } catch (error) {
    console.error("[updateUser] Lỗi không mong đợi:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const userId = String(id);
  console.log("[deleteUser] Xóa user:", userId);
  
  // Sử dụng admin client để bypass RLS
  const { error } = await supabaseAdmin.from("users").delete().eq("id", userId);
  if (error) {
    console.error("[deleteUser] Lỗi khi xóa user:", error);
    throw new Error(error.message);
  }
};
