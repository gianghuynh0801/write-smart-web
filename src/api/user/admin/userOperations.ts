
import { supabase } from "@/integrations/supabase/client";
import { getItem, LOCAL_STORAGE_KEYS } from "@/utils/localStorageService";

/**
 * Kiểm tra quyền admin của người dùng
 * @param userId ID của người dùng cần kiểm tra
 * @returns Thông tin về quyền admin và lỗi nếu có
 */
export const checkAdminRole = async (userId: string) => {
  try {
    // Thử từng phương thức kiểm tra admin một cách tuần tự với cơ chế fallback
    
    // 1. Sử dụng RPC function is_admin nếu có (hiệu quả nhất)
    try {
      const { data: isAdmin, error: rpcError } = await supabase.rpc('is_admin', { uid: userId });
      
      console.log("Admin role check with RPC:", { isAdmin, rpcError });
      
      if (!rpcError && isAdmin === true) {
        return { 
          roleData: { user_id: userId, role: 'admin' }, 
          roleError: null 
        };
      }
    } catch (err) {
      console.log("Error checking admin role with RPC:", err);
    }
    
    // 2. Kiểm tra từ bảng user_roles (chính thức)
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .single();
      
      console.log("Admin role check in user_roles:", { roleData, roleError });
      
      if (!roleError && roleData) {
        return { roleData, roleError: null };
      }
    } catch (err) {
      console.log("Error checking admin role in user_roles table:", err);
    }
    
    // 3. Kiểm tra từ bảng users trước (nhanh nhất)
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      
      if (!userError && userData?.role === 'admin') {
        console.log("Admin role found in users table:", userData);
        return { 
          roleData: { user_id: userId, role: 'admin' }, 
          roleError: null 
        };
      }
    } catch (err) {
      console.log("Error checking admin role in users table:", err);
    }
    
    // Nếu tất cả các phương thức đều thất bại hoặc không tìm thấy vai trò admin
    return { roleData: null, roleError: "Không tìm thấy quyền admin cho người dùng này" };
    
  } catch (error) {
    console.error("Error checking admin role:", error);
    return { 
      roleData: null, 
      roleError: error instanceof Error ? error.message : new Error('Unknown error checking admin role')
    };
  }
};

/**
 * Xác thực token và kiểm tra quyền admin
 * @returns Thông tin về token, user ID và trạng thái admin
 */
export const verifyAdminToken = async () => {
  try {
    // Kiểm tra session token trong localStorage
    const sessionToken = getItem<string>(LOCAL_STORAGE_KEYS.SESSION_TOKEN, false);
    if (!sessionToken) {
      console.log("[verifyAdminToken] Không tìm thấy session token");
      return {
        isValid: false,
        userId: null,
        isAdmin: false,
        error: "Không tìm thấy session token"
      };
    }

    // Kiểm tra session từ token
    const { data: { user }, error: authError } = await supabase.auth.getUser(sessionToken);
    
    if (authError || !user) {
      console.error("[verifyAdminToken] Lỗi xác thực token:", authError);
      return {
        isValid: false,
        userId: null,
        isAdmin: false,
        error: authError?.message || "Token không hợp lệ"
      };
    }
    
    // Kiểm tra quyền admin
    const { roleData, roleError } = await checkAdminRole(user.id);
    
    if (roleError || !roleData) {
      console.error("[verifyAdminToken] Không có quyền admin:", roleError);
      return {
        isValid: true,
        userId: user.id,
        isAdmin: false,
        error: roleError
      };
    }
    
    return {
      isValid: true,
      userId: user.id,
      isAdmin: true,
      error: null
    };
  } catch (error) {
    console.error("[verifyAdminToken] Lỗi không xác định:", error);
    return {
      isValid: false,
      userId: null,
      isAdmin: false,
      error: error instanceof Error ? error.message : "Lỗi không xác định"
    };
  }
};
