
import { db } from "@/integrations/supabase/typeSafeClient";

export const useEmailCheck = () => {
  const checkEmailExists = async (email: string): Promise<boolean> => {
    if (!email || email.trim() === '') {
      return false;
    }
    
    try {
      const { data, error } = await db.users()
        .select('email')
        .eq('email', email.trim().toLowerCase())
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
