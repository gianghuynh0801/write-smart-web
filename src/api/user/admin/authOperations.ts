
import { supabase } from "@/integrations/supabase/client";

/**
 * Hàm trợ giúp để lấy token admin khi cần
 * @returns Token admin nếu có, null nếu không có
 */
export const getAdminToken = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("[getAdminToken] Không có session hiện tại");
      return null;
    }
    
    // Thử kiểm tra quyền admin
    try {
      const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', { uid: session.user.id });
      
      if (rpcError || !isAdmin) {
        console.log("[getAdminToken] Người dùng không phải là admin hoặc lỗi khi kiểm tra:", rpcError);
        return null;
      }
    } catch (error) {
      console.error("[getAdminToken] Lỗi khi kiểm tra quyền admin:", error);
      
      // Thử phương pháp khác nếu không thể sử dụng RPC
      try {
        const { data, error } = await supabase
          .from('seo_project.user_roles')
          .select('*')
          .eq('user_id', session.user.id)
          .eq('role', 'admin')
          .maybeSingle();
        
        if (error || !data) {
          console.log("[getAdminToken] Người dùng không phải là admin hoặc lỗi khi kiểm tra:", error);
          return null;
        }
      } catch (innerError) {
        console.error("[getAdminToken] Lỗi khi kiểm tra quyền admin (phương pháp thay thế):", innerError);
        return null;
      }
    }
    
    // Nếu đã vượt qua các kiểm tra trên, người dùng là admin
    return session.access_token;
  } catch (error) {
    console.error("[getAdminToken] Lỗi không mong đợi:", error);
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
