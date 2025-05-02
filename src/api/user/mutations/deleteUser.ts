
import { supabase } from "@/integrations/supabase/client";
import { authService, isAuthError } from "@/services/auth";

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
    
    if (!adminToken) {
      throw new Error("Không có quyền xóa người dùng");
    }
    
    // Gọi Edge Function với token xác thực
    const { data, error: invocationError } = await supabase.functions.invoke(
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
      if (isAuthError(invocationError)) {
        // Làm mới token và thử lại
        const newToken = await authService.getAdminToken(true);
        
        if (newToken) {
          console.log("[deleteUser] Thử lại với token mới");
          
          const { data: retryData, error: retryError } = await supabase.functions.invoke(
            'delete-user',
            {
              body: { userId },
              headers: {
                Authorization: `Bearer ${newToken}`
              }
            }
          );
          
          if (retryError) {
            if (typeof retryError === 'object' && retryError !== null) {
              const errorMessage = (retryError as any).message || "Lỗi không xác định";
              throw new Error(`Lỗi xóa user: ${errorMessage}`);
            } else {
              throw new Error(`Lỗi xóa user: ${String(retryError)}`);
            }
          }
          
          return; // Thành công
        }
      }
      
      if (typeof invocationError === 'object' && invocationError !== null) {
        const errorMessage = (invocationError as any).message || "Lỗi không xác định";
        throw new Error(`Lỗi xóa user: ${errorMessage}`);
      } else {
        throw new Error(`Lỗi xóa user: ${String(invocationError)}`);
      }
    }
    
    if (data?.error) {
      throw new Error(`Lỗi xóa user: ${data.error}`);
    }
    
  } catch (error) {
    console.error("[deleteUser] Lỗi không mong đợi:", error);
    
    // Nếu là lỗi xác thực, thử làm mới token
    if (isAuthError(error)) {
      await authService.handleAuthError(error);
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
};
