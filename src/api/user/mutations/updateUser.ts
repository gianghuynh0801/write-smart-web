
import { supabase } from "@/integrations/supabase/client";
import { User, UserFormValues } from "@/types/user";
import { parseUser } from "../userParser";
import { authService, isAuthError } from "@/services/auth";
import { clearUserCache, clearUsersCache } from "@/utils/api/userApiUtils";

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
      if (isAuthError(invocationError)) {
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
            // Xóa cache sau khi cập nhật thành công
            clearUserCache(userId);
            clearUsersCache();
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
      
      if (isAuthError(new Error(responseData.error))) {
        await authService.getAdminToken(true);
      }
      
      throw new Error(`Lỗi cập nhật: ${responseData.error}`);
    }
    
    if (!responseData.data) {
      console.error("[updateUser] Edge Function không trả về dữ liệu user:", responseData);
      throw new Error("Dữ liệu người dùng không hợp lệ");
    }

    // Xóa cache sau khi cập nhật thành công
    clearUserCache(userId);
    clearUsersCache();
    
    // Phân tích và trả về dữ liệu người dùng đã cập nhật
    return parseUser(responseData.data);
  } catch (error) {
    console.error("[updateUser] Lỗi không mong đợi:", error);
    
    // Nếu là lỗi xác thực, thử làm mới token và thử lại
    if (isAuthError(error)) {
      await authService.handleAuthError(error);
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
};
