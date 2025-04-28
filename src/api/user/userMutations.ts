
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
  
  // Lấy token admin từ localStorage
  const adminToken = getItem<string>(LOCAL_STORAGE_KEYS.SESSION_TOKEN, false);
  if (!adminToken) {
    console.error("[createUser] Không tìm thấy token admin");
    throw new Error("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại");
  }
  
  try {
    // Gọi Edge Function với token xác thực
    const { data: responseData, error: invocationError } = await supabase.functions.invoke(
      'create-user',
      {
        body: { userData },
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );

    if (invocationError) {
      console.error("[createUser] Lỗi khi gọi Edge Function:", invocationError);
      throw new Error(`Lỗi tạo user: ${invocationError.message}`);
    }
    
    // Kiểm tra phản hồi từ Edge Function
    if (!responseData) {
      console.error("[createUser] Edge Function không trả về dữ liệu");
      throw new Error("Không nhận được dữ liệu từ máy chủ");
    }
    
    if (responseData.error) {
      console.error("[createUser] Edge Function trả về lỗi:", responseData.error);
      throw new Error(`Lỗi tạo user: ${responseData.error}`);
    }

    if (!responseData.data) {
      console.error("[createUser] Edge Function không trả về dữ liệu user");
      throw new Error("Dữ liệu người dùng không hợp lệ");
    }

    // Phân tích và trả về dữ liệu người dùng đã tạo
    const createdUser = parseUser(responseData.data);
    return createdUser;
  } catch (error) {
    console.error("[createUser] Lỗi không mong đợi:", error);
    
    // Nếu có lỗi xác thực, cố gắng làm mới phiên đăng nhập
    if (error instanceof Error && 
        (error.message.includes('xác thực') || 
         error.message.includes('phiên đăng nhập') ||
         error.message.includes('401') || 
         error.message.includes('403'))) {
      
      // Thử làm mới phiên đăng nhập
      console.log("[createUser] Phát hiện lỗi xác thực, thử làm mới phiên đăng nhập");
      
      // Lưu token trong localStorage nếu có
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
      }
    }
    
    throw error;
  }
};

// Hàm trợ giúp để lấy và làm mới token admin khi cần
const getAdminToken = async (): Promise<string | null> => {
  try {
    // Đầu tiên kiểm tra token từ localStorage
    const adminToken = getItem<string>(LOCAL_STORAGE_KEYS.SESSION_TOKEN, false);
    if (adminToken) {
      console.log("[getAdminToken] Đã tìm thấy token trong local storage");
      return adminToken;
    }
    
    // Nếu không có trong localStorage, kiểm tra session hiện tại
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("[getAdminToken] Lỗi khi lấy session:", sessionError);
      return null;
    }
    
    if (session?.access_token) {
      console.log("[getAdminToken] Đã tìm thấy session token hợp lệ");
      // Lưu token mới vào localStorage
      setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
      return session.access_token;
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
    const { data: responseData, error: invocationError } = await supabase.functions.invoke(
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
        
        // Làm mới token
        const { data: { session } } = await supabase.auth.getSession();
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
    
    // Nếu là lỗi xác thực, thử làm mới session
    if (error instanceof Error && 
        (error.message.includes('xác thực') || 
         error.message.includes('phiên đăng nhập') ||
         error.message.includes('401') || 
         error.message.includes('403'))) {
      
      // Thử làm mới phiên đăng nhập
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, session.access_token);
      }
      
      // Thử lại một lần nữa sau khi làm mới token
      if (session?.access_token) {
        console.log("[updateUser] Thử lại với token mới");
        await wait(500); // Đợi một chút trước khi thử lại
        
        const { data: retryData, error: retryError } = await supabase.functions.invoke(
          'update-user',
          {
            body: { id: userId, userData },
            headers: {
              Authorization: `Bearer ${session.access_token}`
            }
          }
        );
        
        if (retryError) {
          console.error("[updateUser] Lỗi khi thử lại:", retryError);
          throw new Error(`Lỗi cập nhật: ${retryError.message}`);
        }
        
        if (retryData?.data) {
          return parseUser(retryData.data);
        }
      }
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const userId = String(id);
  console.log("[deleteUser] Xóa user:", userId);
  
  try {
    // Lấy token admin
    const adminToken = await getAdminToken();
    
    if (!adminToken) {
      console.error("[deleteUser] Không tìm thấy token admin");
      throw new Error("Không có phiên đăng nhập hợp lệ, vui lòng đăng nhập lại");
    }
    
    // Gọi Edge Function với token xác thực
    const { error: invocationError } = await supabase.functions.invoke(
      'delete-user',
      {
        body: { userId },
        headers: {
          Authorization: `Bearer ${adminToken}`
        }
      }
    );
    
    if (invocationError) {
      console.error("[deleteUser] Lỗi khi gọi Edge Function:", invocationError);
      throw new Error(`Lỗi xóa user: ${invocationError.message}`);
    }
  } catch (error) {
    console.error("[deleteUser] Lỗi không mong đợi:", error);
    throw error instanceof Error ? error : new Error(String(error));
  }
};
