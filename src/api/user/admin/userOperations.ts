
import { supabase } from "@/integrations/supabase/client";

export const checkAdminRole = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (error) {
      console.error("Lỗi khi kiểm tra quyền admin:", error);
      return {
        roleData: null,
        roleError: error.message
      };
    }

    return {
      roleData: data,
      roleError: null
    };
  } catch (error) {
    console.error("Lỗi không mong muốn khi kiểm tra quyền admin:", error);
    return {
      roleData: null,
      roleError: error instanceof Error ? error.message : 'Lỗi không xác định'
    };
  }
};

