
import { supabase } from "@/integrations/supabase/client";

export const defaultAdmin = {
  username: "admin",
  password: "admin@1238",
  email: "admin@example.com"
};

/**
 * Checks if a user has admin role by querying multiple sources
 * @param userId The user ID to check
 * @returns Object containing role data and any error
 */
export const checkAdminRole = async (userId: string) => {
  console.log("Checking admin role for user:", userId);
  
  try {
    // Thử từng phương thức kiểm tra admin một cách tuần tự với cơ chế fallback
    
    // 1. Kiểm tra từ bảng users trước (nhanh nhất)
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
      // Tiếp tục với phương thức tiếp theo nếu lỗi
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
      // Tiếp tục với phương thức tiếp theo nếu lỗi
    }
    
    // 3. Sử dụng RPC function is_admin nếu có (hiệu quả nhất nhưng có thể không có sẵn)
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
      // Đây là phương thức cuối cùng, không có fallback nữa
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
}
