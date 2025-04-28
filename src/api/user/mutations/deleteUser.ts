
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";

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
