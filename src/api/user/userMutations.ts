
import { supabase } from "@/integrations/supabase/client";
import { User, UserFormValues } from "@/types/user";
import { parseUser } from "./userParser";
import { getItem, setItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

// Function để đợi một khoảng thời gian
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Tạo người dùng mới
 * @param userData Thông tin người dùng cần tạo
 * @returns Thông tin người dùng đã tạo
 */
export const createUser = async (userData: UserFormValues): Promise<User> => {
  console.log("[createUser] Tạo user mới với dữ liệu:", userData);
  
  try {
    // Lấy token admin từ localStorage và session hiện tại
    const adminToken = await getAdminToken();
    
    if (!adminToken) {
      console.error("[createUser] Không tìm thấy token admin");
      throw new Error("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại");
    }
    
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
    if (isAuthError(error)) {
      await refreshSessionToken();
    }
    
    throw error;
  }
};

/**
 * Kiểm tra xem lỗi có phải là lỗi xác thực hay không
 * @param error Lỗi cần kiểm tra
 * @returns True nếu là lỗi xác thực, False nếu không phải
 */
const isAuthError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const errorMsg = error.message.toLowerCase();
    return errorMsg.includes('xác thực') || 
           errorMsg.includes('phiên đăng nhập') ||
           errorMsg.includes('token') || 
           errorMsg.includes('auth') ||
           errorMsg.includes('401') || 
           errorMsg.includes('403');
  }
  return false;
};

/**
 * Làm mới token session
 * @returns Token mới nếu thành công, null nếu thất bại
 */
export const refreshSessionToken = async (): Promise<string | null> => {
  try {
    console.log("[refreshSessionToken] Đang làm mới token...");
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      console.error("[refreshSessionToken] Lỗi khi làm mới session:", error);
      return null;
    }
    
    console.log("[refreshSessionToken] Đã làm mới token thành công");
    setItem(LOCAL_STORAGE_KEYS.SESSION_TOKEN, data.session.access_token);
    return data.session.access_token;
  } catch (error) {
    console.error("[refreshSessionToken] Lỗi không mong đợi:", error);
    return null;
  }
};

/**
 * Hàm trợ giúp để lấy và làm mới token admin khi cần
 * @returns Token admin nếu có, null nếu không có
 */
export const getAdminToken = async (): Promise<string | null> => {
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

/**
 * Cập nhật thông tin người dùng
 * @param id ID của người dùng cần cập nhật
 * @param userData Thông tin người dùng mới
 * @returns Thông tin người dùng sau khi cập nhật
 */
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
      
      if (isAuthError(new Error(responseData.error))) {
        await refreshSessionToken();
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
    
    // Nếu là lỗi xác thực, thử làm mới token và thử lại
    if (isAuthError(error)) {
      const newToken = await refreshSessionToken();
      
      if (newToken) {
        console.log("[updateUser] Thử lại với token mới");
        await wait(500); // Đợi một chút trước khi thử lại
        
        try {
          const { data: retryData, error: retryError } = await supabase.functions.invoke(
            'update-user',
            {
              body: { id: userId, userData },
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            }
          );
          
          if (retryError) {
            console.error("[updateUser] Lỗi khi thử lại:", retryError);
            throw new Error(`Lỗi cập nhật: ${retryError.message}`);
          }
          
          if (retryData?.data) {
            return parseUser(retryData.data);
          } else {
            throw new Error("Không nhận được dữ liệu khi thử lại");
          }
        } catch (retryError) {
          console.error("[updateUser] Thử lại thất bại:", retryError);
          throw new Error(`Thử lại thất bại: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
        }
      }
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
};

/**
 * Xóa người dùng
 * @param id ID của người dùng cần xóa
 */
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
    
    // Nếu là lỗi xác thực, thử làm mới token và thử lại
    if (isAuthError(error)) {
      const newToken = await refreshSessionToken();
      
      if (newToken) {
        console.log("[deleteUser] Thử lại với token mới");
        await wait(500); // Đợi một chút trước khi thử lại
        
        try {
          const { error: retryError } = await supabase.functions.invoke(
            'delete-user',
            {
              body: { userId },
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            }
          );
          
          if (retryError) {
            console.error("[deleteUser] Lỗi khi thử lại:", retryError);
            throw new Error(`Lỗi xóa user: ${retryError.message}`);
          }
          
          return; // Thành công
        } catch (retryError) {
          console.error("[deleteUser] Thử lại thất bại:", retryError);
          throw new Error(`Thử lại thất bại: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
        }
      }
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
};
