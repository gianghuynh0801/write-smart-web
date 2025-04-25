
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
    // Check if user exists in user_roles table with admin role
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
