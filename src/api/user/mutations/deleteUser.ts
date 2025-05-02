
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
            // Cải thiện thông báo lỗi để nó cụ thể hơn về nguyên nhân thất bại
            const errorMessage = typeof retryError === 'object' && retryError !== null 
              ? (retryError as any).message || "Lỗi không xác định" 
              : String(retryError);
              
            throw new Error(`Lỗi xóa user: ${errorMessage}`);
          }
          
          return; // Thành công
        }
      }
      
      // Cải thiện xử lý lỗi và trích xuất thông báo
      if (typeof invocationError === 'object' && invocationError !== null) {
        // Trích xuất thông báo chi tiết từ response nếu có
        let detailedMessage = (invocationError as any).message || "Lỗi không xác định";
        
        // Kiểm tra xem lỗi có chứa thông tin từ Edge Function không
        const responseError = (invocationError as any).error;
        if (responseError && typeof responseError === 'object') {
          detailedMessage = responseError.message || detailedMessage;
        }
        
        throw new Error(`Lỗi xóa user: ${detailedMessage}`);
      } else {
        throw new Error(`Lỗi xóa user: ${String(invocationError)}`);
      }
    }
    
    if (data?.error) {
      throw new Error(`Lỗi xóa user: ${data.error}`);
    }
    
    console.log("[deleteUser] Xóa user thành công:", userId);
    
  } catch (error) {
    console.error("[deleteUser] Lỗi không mong đợi:", error);
    
    // Nếu là lỗi xác thực, thử làm mới token
    if (isAuthError(error)) {
      await authService.handleAuthError(error);
    }
    
    throw error instanceof Error ? error : new Error(String(error));
  }
};
