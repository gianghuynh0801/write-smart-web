
import { supabase } from "@/integrations/supabase/client";

export const useEmailCheck = () => {
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle();
        
      return !!data;
    } catch (error) {
      console.error("Lỗi khi kiểm tra email:", error);
      return false;
    }
  };

  return { checkEmailExists };
};
