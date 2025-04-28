
import { supabase } from "@/integrations/supabase/client";

export const defaultAdmin = {
  username: "admin",
  password: "admin@1238",
  email: "admin@example.com"
};

/**
 * Checks if a user has admin role by querying the user_roles table
 * @param userId The user ID to check
 * @returns Object containing role data and any error
 */
export const checkAdminRole = async (userId: string) => {
  console.log("Checking admin role for user:", userId);
  
  try {
    // Kiểm tra vai trò từ bảng users trước
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
    
    // Nếu không tìm thấy trong users table, kiểm tra trong user_roles table
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .single();
    
    console.log("Admin role check result:", { roleData, roleError });
    
    return { roleData, roleError };
  } catch (error) {
    console.error("Error checking admin role:", error);
    return { 
      roleData: null, 
      roleError: error instanceof Error ? error : new Error('Unknown error checking admin role') 
    };
  }
}
