
import { supabase } from "@/integrations/supabase/client";
import { User, UserFormValues } from "@/types/user";
import { parseUser } from "./userParser";
import { authService } from "@/services/authService";
import { tokenManager } from "@/utils/tokenManager";

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
    // Lấy token admin
    const adminToken = await authService.getAdminToken();
    
    console.log("[createUser] Gọi Edge Function với token");
    
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
      
      // Kiểm tra nếu là lỗi xác thực
      if (authService.isAuthError(invocationError)) {
        // Làm mới token và thử lại
        const newToken = await authService.getAdminToken(true);
        
        if (newToken) {
          console.log("[createUser] Thử lại với token mới");
          const { data: retryData, error: retryError } = await supabase.functions.invoke(
            'create-user',
            {
              body: { userData },
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            }
          );
          
          if (retryError) {
            throw new Error(`Lỗi tạo user: ${retryError.message}`);
          }
          
          if (retryData?.data) {
            return parseUser(retryData.data);
          }
        }
      }
      
      throw new Error(`Lỗi tạo user: ${invocationError.message}`);
    }
    
    // Kiểm tra phản hồi từ Edge Function
    if (!responseData) {
      console.error("[createUser] Edge Function không trả về dữ liệu");
      throw new Error("Không nhận được dữ liệu từ máy chủ");
    }
    
    if (responseData.error) {
      console.error("[createUser] Edge Function trả về lỗi:", responseData.error);
      
      if (authService.isAuthError(new Error(responseData.error))) {
        await authService.getAdminToken(true);
      }
      
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
    if (authService.isAuthError(error)) {
      await authService.handleAuthError(error);
    }
    
    throw error;
  }
};

/**
 * Làm mới token session
 * @returns Token mới nếu thành công, null nếu thất bại
 */
export const refreshSessionToken = async (): Promise<string | null> => {
  return tokenManager.refreshToken();
};

/**
 * Hàm trợ giúp để lấy token admin khi cần
 * @returns Token admin nếu có, null nếu không có
 */
export const getAdminToken = async (): Promise<string | null> => {
  try {
    return await authService.getAdminToken();
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
    const adminToken = await authService.getAdminToken();
    
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
      
      // Kiểm tra nếu là lỗi xác thực
      if (authService.isAuthError(invocationError)) {
        // Làm mới token và thử lại
        const newToken = await authService.getAdminToken(true);
        
        if (newToken) {
          console.log("[updateUser] Thử lại với token mới");
          
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
            throw new Error(`Lỗi cập nhật: ${retryError.message}`);
          }
          
          if (retryData?.data) {
            return parseUser(retryData.data);
          }
        }
      }
      
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
      
      if (authService.isAuthError(new Error(responseData.error))) {
        await authService.getAdminToken(true);
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
    if (authService.isAuthError(error)) {
      await authService.handleAuthError(error);
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
    const adminToken = await authService.getAdminToken();
    
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
      
      // Kiểm tra nếu là lỗi xác thực
      if (authService.isAuthError(invocationError)) {
        // Làm mới token và thử lại
        const newToken = await authService.getAdminToken(true);
        
        if (newToken) {
          console.log("[deleteUser] Thử lại với token mới");
          
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
            throw new Error(`Lỗi xóa user: ${retryError.message}`);
          }
          
          return; // Thành công
        }
      }
      
      throw new Error(`Lỗi xóa user: ${invocationError.message}`);
    }
  } catch (error) {
    console.error("[deleteUser] Lỗi không mong đợi:", error);
    
    // Nếu là lỗi xác thực, thử làm mới token
    if (authService.isAuthError(error)) {
      await authService.handleAuthError(error);
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
};
