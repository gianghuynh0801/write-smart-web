
import { supabase } from "@/integrations/supabase/client";

export const useEmailCheck = () => {
  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!email || email.trim() === '') {
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.trim().toLowerCase() as any)
        .maybeSingle();
      
      if (error) {
        console.error("Lỗi khi kiểm tra email:", error);
        // Default to false on error to allow the user to try to proceed
        return false;
      }
        
      return !!data;
    } catch (error) {
      console.error("Lỗi không mong đợi khi kiểm tra email:", error);
      return false;
    }
  };

  return { checkEmailExists };
};
