
import { supabase } from "@/integrations/supabase/client";
import { UserSubscription } from "@/types/subscriptions";
import { createClient } from "@supabase/supabase-js";

// Create a separate admin client that can bypass RLS
// This function creates an admin client that can bypass Row Level Security
const createAdminClient = () => {
  const supabaseUrl = "https://lxhawtndkubaeljbaylp.supabase.co";
  const supabaseServiceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx4aGF3dG5ka3ViYWVsamJheWxwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NTM5OTExMSwiZXhwIjoyMDYwOTc1MTExfQ.9hsOts4HHM4tvqp5JkESOLuAJLHNYOsME7O4ekOq4oE";
  
  console.log("Khởi tạo admin client với service role key");
  
  // Cấu hình client để tránh lỗi nhiều instance và đảm bảo hoạt động chính xác
  return createClient(
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
      .eq("status", "active");
      
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
    
    const client = getAdminClient();

    const { data, error } = await client
      .from("user_subscriptions")
      .select(`
        id,
        start_date,
        end_date,
        status,
        user_id,
        subscription_id,
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
    
    // Explicitly type the result to match UserSubscription
    if (data) {
      // Fix: Properly handle the subscriptions object
      const subscription: UserSubscription = {
        id: data.id,
        user_id: data.user_id,
        subscription_id: data.subscription_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        subscriptions: data.subscriptions ? {
          id: data.subscriptions.id, // Access as single object, not array
          name: data.subscriptions.name, // Access as single object, not array
          description: null,
          price: 0,
          period: '',
          features: null
        } : undefined
      };
      return subscription;
    }
    
    return null;
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý:", error);
    return null;
  }
};
