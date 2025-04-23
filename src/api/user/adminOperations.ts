
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Create a separate admin client that can bypass RLS
// This function creates an admin client that can bypass Row Level Security
const createAdminClient = () => {
  const supabaseUrl = "https://ctegtqmkxkbqhwlqukfd.supabase.co";
  const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZWd0cW1reGticWh3bHF1a2ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTM5NzQ4NSwiZXhwIjoyMDYwOTczNDg1fQ.6Tmm3yDFU9z8jN45CJkjYsbd8J1irfap_kGyAj_TAWA";
  
  // Use the service_role key to create a client that bypasses RLS
  return createClient<Database>(
    supabaseUrl, 
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Create a single admin client instance to be reused
const adminClient = createAdminClient();

export const createUserSubscriptionAsAdmin = async (
  userId: string, 
  subscriptionId: number, 
  startDate: string,
  endDate: string
): Promise<boolean> => {
  try {
    console.log("Creating subscription with admin privileges:", { userId, subscriptionId, startDate, endDate });
    
    // Ensure all existing subscriptions for this user are set to inactive
    const { error: updateError } = await adminClient
      .from("user_subscriptions")
      .update({ status: "inactive" })
      .eq("user_id", userId)
      .eq("status", "active");
      
    if (updateError) {
      console.error("Lỗi khi cập nhật gói đăng ký cũ:", updateError.message);
      throw new Error(`Could not deactivate old subscriptions: ${updateError.message}`);
    }
    
    // Create the new subscription with direct database access
    const { error: insertError } = await adminClient
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      });
      
    if (insertError) {
      console.error("Lỗi khi tạo gói đăng ký mới:", insertError.message);
      throw new Error(`Could not create new subscription: ${insertError.message}`);
    }
    
    return true;
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý:", error);
    throw error; // Re-throw to allow proper error handling upstream
  }
};

export const getUserActiveSubscription = async (userId: string) => {
  try {
    console.log("Fetching active subscription for user:", userId);

    const { data, error } = await adminClient
      .from("user_subscriptions")
      .select(`
        id,
        start_date,
        end_date,
        status,
        subscriptions:subscription_id (
          id,
          name
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
      
    if (error) {
      if (error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error("Lỗi khi lấy thông tin gói đăng ký:", error.message);
      }
      return null;
    }
    
    console.log("Active subscription data:", data);
    return data;
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý:", error);
    return null;
  }
};
