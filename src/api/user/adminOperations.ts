
import { createClient } from "@supabase/supabase-js";
import { UserSubscription } from "@/types/subscriptions";
import type { Database } from "@/integrations/supabase/types";

// Create a separate admin client that can bypass RLS
// This function creates an admin client that can bypass Row Level Security
const createAdminClient = () => {
  const supabaseUrl = "https://ctegtqmkxkbqhwlqukfd.supabase.co";
  const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0ZWd0cW1reGticWh3bHF1a2ZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTM5NzQ4NSwiZXhwIjoyMDYwOTczNDg1fQ.6Tmm3yDFU9z8jN45CJkjYsbd8J1irfap_kGyAj_TAWA";
  
  console.log("Khởi tạo admin client với service role key");
  
  // Cấu hình client để tránh lỗi nhiều instance và đảm bảo hoạt động chính xác
  return createClient<Database>(
    supabaseUrl, 
    supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        storage: undefined
      }
    }
  );
};

// Create a single admin client instance to be reused
let adminClient: ReturnType<typeof createAdminClient>;

// Ensure we only initialize the client once
const getAdminClient = () => {
  if (!adminClient) {
    adminClient = createAdminClient();
    console.log("Admin client đã được khởi tạo");
  }
  return adminClient;
};

export const createUserSubscriptionAsAdmin = async (
  userId: string, 
  subscriptionId: number, 
  startDate: string,
  endDate: string
): Promise<boolean> => {
  try {
    console.log("Creating subscription with admin privileges:", { userId, subscriptionId, startDate, endDate });
    
    const client = getAdminClient();
    
    // Ensure all existing subscriptions for this user are set to inactive
    const { error: updateError } = await client
      .from("user_subscriptions")
      .update({ status: "inactive" })
      .eq("user_id", userId)
      .eq("status", "active") as { error: any };
      
    if (updateError) {
      console.error("Lỗi khi cập nhật gói đăng ký cũ:", updateError.message);
      throw new Error(`Could not deactivate old subscriptions: ${updateError.message}`);
    }
    
    // Create the new subscription with direct database access
    const { error: insertError } = await client
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      }) as { error: any };
      
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
    
    const client = getAdminClient();

    const { data, error } = await client
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
      .maybeSingle() as { data: UserSubscription | null, error: any };
      
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
