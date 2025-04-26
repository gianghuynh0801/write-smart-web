
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
  endDate: string,
  status: string = 'active'
): Promise<boolean> => {
  try {
    console.log("Thực hiện thao tác gói đăng ký với quyền admin:", { userId, subscriptionId, startDate, endDate, status });
    
    // Kiểm tra user_id hợp lệ
    if (!userId) {
      throw new Error("ID người dùng không được để trống");
    }
    
    const client = getAdminClient();
    
    // Nếu đang hủy gói đăng ký hiện tại (status = 'inactive')
    if (status === 'inactive') {
      console.log("Đang hủy tất cả gói đăng ký hiện tại của người dùng:", userId);
      
      const { error: updateError } = await client
        .from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("user_id", userId)
        .eq("status", "active");
        
      if (updateError) {
        console.error("Lỗi khi hủy gói đăng ký hiện tại:", updateError.message);
        throw new Error(`Không thể hủy gói đăng ký hiện tại: ${updateError.message}`);
      }
      
      console.log("Đã hủy thành công tất cả gói đăng ký hiện tại");
      
      // Nếu chỉ cần hủy gói đăng ký hiện tại thì dừng tại đây
      if (subscriptionId === -1 || !startDate || !endDate) {
        console.log("Không tạo gói đăng ký mới, chỉ hủy gói hiện tại");
        return true;
      }
    }
    
    // Nếu đang tạo gói đăng ký mới (status = 'active')
    if (status === 'active') {
      // Kiểm tra các tham số bắt buộc
      if (subscriptionId <= 0) {
        throw new Error("ID gói đăng ký không hợp lệ");
      }
      
      if (!startDate || !endDate) {
        throw new Error("Ngày bắt đầu và kết thúc là bắt buộc");
      }
      
      // Kiểm tra gói đăng ký tồn tại trong hệ thống
      const { data: subscriptionExists, error: checkError } = await client
        .from("subscriptions")
        .select("id")
        .eq("id", subscriptionId)
        .maybeSingle();
        
      if (checkError) {
        console.error("Lỗi khi kiểm tra gói đăng ký:", checkError.message);
        throw new Error(`Không thể kiểm tra gói đăng ký: ${checkError.message}`);
      }
      
      if (!subscriptionExists) {
        console.error("Gói đăng ký không tồn tại trong hệ thống:", subscriptionId);
        throw new Error(`Gói đăng ký ID=${subscriptionId} không tồn tại trong hệ thống`);
      }
      
      // Đảm bảo đã hủy các gói đăng ký cũ trước khi tạo gói mới
      const { error: updateError } = await client
        .from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("user_id", userId)
        .eq("status", "active");
        
      if (updateError) {
        console.error("Lỗi khi cập nhật gói đăng ký cũ:", updateError.message);
        throw new Error(`Không thể hủy gói đăng ký cũ: ${updateError.message}`);
      }
      
      // Tạo gói đăng ký mới với quyền truy cập cơ sở dữ liệu trực tiếp
      console.log("Đang tạo gói đăng ký mới:", { userId, subscriptionId, startDate, endDate, status });
      
      const { error: insertError } = await client
        .from("user_subscriptions")
        .insert({
          user_id: userId,
          subscription_id: subscriptionId,
          start_date: startDate,
          end_date: endDate,
          status: status
        });
        
      if (insertError) {
        console.error("Lỗi khi tạo gói đăng ký mới:", insertError.message);
        throw new Error(`Không thể tạo gói đăng ký mới: ${insertError.message}`);
      }
      
      console.log("Đã tạo gói đăng ký mới thành công");
    }
    
    return true;
  } catch (error) {
    console.error("Lỗi trong quá trình xử lý gói đăng ký:", error);
    throw error; // Re-throw để xử lý lỗi ở các hàm gọi
  }
};

export const getUserActiveSubscription = async (userId: string) => {
  try {
    console.log("Đang lấy thông tin gói đăng ký hiện tại cho người dùng:", userId);
    
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
      // Handle subscriptions data appropriately
      const subscription: UserSubscription = {
        id: data.id,
        user_id: data.user_id,
        subscription_id: data.subscription_id,
        start_date: data.start_date,
        end_date: data.end_date,
        status: data.status,
        subscriptions: data.subscriptions ? {
          id: (data.subscriptions as any).id,
          name: (data.subscriptions as any).name,
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
