
import { authService } from "@/services/authService";
import { supabase } from "@/integrations/supabase/client";

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
 * Làm mới token session
 * @returns Token mới nếu thành công, null nếu thất bại
 */
export const refreshSessionToken = async (): Promise<string | null> => {
  try {
    // Lấy session hiện tại
    const { data } = await supabase.auth.getSession();
    
    if (!data.session) {
      console.log("[refreshSessionToken] Không có session hiện tại");
      return null;
    }
    
    // Làm mới token
    const { data: refreshData, error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error("[refreshSessionToken] Lỗi làm mới token:", error);
      return null;
    }
    
    if (!refreshData.session) {
      console.log("[refreshSessionToken] Làm mới không trả về session");
      return null;
    }
    
    console.log("[refreshSessionToken] Đã làm mới token thành công");
    return refreshData.session.access_token;
  } catch (error) {
    console.error("[refreshSessionToken] Lỗi không mong đợi:", error);
    return null;
  }
};
