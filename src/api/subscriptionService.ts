import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Subscription, UserSubscription } from "@/types/subscriptions";

// Helper types
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type UserSubscriptionRow = Database["public"]["Tables"]["user_subscriptions"]["Row"];

// Fetch all subscription plans
export const fetchSubscriptionPlans = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("price", { ascending: true });

  if (error) {
    console.error("Lỗi khi lấy danh sách gói:", error);
    throw new Error(`Error fetching subscription plans: ${error.message}`);
  }

  // Parse features array correctly
  return (data || []).map((row) => ({
    ...row,
    features: Array.isArray(row.features)
      ? row.features
      : typeof row.features === "string"
        ? JSON.parse(row.features)
        : row.features === null || row.features === undefined 
          ? [] 
          : Array.isArray(JSON.parse(JSON.stringify(row.features)))
            ? JSON.parse(JSON.stringify(row.features))
            : [],
  })) as Subscription[];
};

// Fetch current user subscription with full details
export const fetchUserSubscription = async (userId: string) => {
  console.log("Đang lấy thông tin gói đăng ký cho user:", userId);
  
  try {
    // Get active subscription with full subscription details
    const { data, error } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        user_id,
        subscription_id,
        start_date,
        end_date,
        status,
        subscriptions:subscription_id (
          id,
          name,
          price,
          period,
          features,
          description
        )
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      console.error("Lỗi khi lấy thông tin gói đăng ký:", error);
      return {
        plan: "Không có",
        planId: null,
        status: "inactive",
        startDate: "",
        endDate: "",
        price: 0,
        usageArticles: 0,
        totalArticles: 0
      };
    }

    if (!data) {
      console.log("Không tìm thấy gói đăng ký đang hoạt động");
      return {
        plan: "Không có",
        planId: null,
        status: "inactive",
        startDate: "",
        endDate: "",
        price: 0,
        usageArticles: 0,
        totalArticles: 0
      };
    }

    // Parse subscription data
    const subscription = data.subscriptions;
    if (!subscription) {
      console.error("Không tìm thấy thông tin chi tiết gói đăng ký");
      return {
        plan: "Lỗi",
        planId: data.subscription_id,
        status: data.status,
        startDate: data.start_date,
        endDate: data.end_date,
        price: 0,
        usageArticles: 0,
        totalArticles: 0
      };
    }

    // Get usage statistics (implement your actual usage logic here)
    // This is a placeholder - replace with your actual usage tracking
    const usageStats = {
      used: 8,
      total: 30
    };

    console.log("Đã lấy thông tin gói đăng ký thành công:", {
      plan: subscription.name,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date
    });

    return {
      plan: subscription.name,
      planId: subscription.id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      price: subscription.price,
      usageArticles: usageStats.used,
      totalArticles: usageStats.total
    };
  } catch (error) {
    console.error("Lỗi không mong muốn:", error);
    return {
      plan: "Lỗi",
      planId: null,
      status: "error",
      startDate: "",
      endDate: "",
      price: 0,
      usageArticles: 0,
      totalArticles: 0
    };
  }
};

// Update user subscription
export const updateUserSubscription = async (userId: string, planId: number) => {
  // Get plan details
  const { data: planData, error: planError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", planId)
    .maybeSingle();

  if (planError) throw new Error(`Error fetching plan: ${planError.message}`);
  if (!planData) throw new Error("Plan not found");

  // Type safe features
  const typedPlanData: Subscription = {
    ...planData,
    features: Array.isArray(planData.features)
      ? (planData.features as string[])
      : typeof planData.features === "string"
        ? JSON.parse(planData.features)
        : planData.features === null || planData.features === undefined ? null : planData.features,
  };

  // Calculate subscription dates
  const startDate = new Date().toISOString().split("T")[0];
  const endDateObj = new Date();
  endDateObj.setMonth(endDateObj.getMonth() + 1); // 1 month
  const endDate = endDateObj.toISOString().split("T")[0];

  // Check if user already has active subscription
  const { data: existingSubscription, error: subError } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (subError && subError.code !== "PGRST116") {
    throw new Error(`Error checking existing subscription: ${subError.message}`);
  }

  try {
    // Inactivate old subscription if exists
    if (existingSubscription && existingSubscription.id) {
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({ status: "inactive" })
        .eq("id", existingSubscription.id);

      if (updateError) throw new Error(`Error updating old subscription: ${updateError.message}`);
    }

    // Create new subscription
    const { error: insertError } = await supabase
      .from("user_subscriptions")
      .insert([
        {
          user_id: userId,
          subscription_id: planId,
          start_date: startDate,
          end_date: endDate,
          status: "active",
        },
      ]);

    if (insertError) throw new Error(`Error creating subscription: ${insertError.message}`);

    // Record payment
    const { error: paymentError } = await supabase
      .from("payment_history")
      .insert([
        {
          user_id: userId,
          amount: typedPlanData.price,
          status: "success",
          description: `Thanh toán gói ${typedPlanData.name}`,
        },
      ]);

    if (paymentError) throw new Error(`Error recording payment: ${paymentError.message}`);

    return {
      success: true,
      message: `Đã nâng cấp lên gói ${typedPlanData.name}`,
    };
  } catch (err) {
    throw err;
  }
};

// Cancel user subscription
export const cancelUserSubscription = async (userId: string) => {
  // Find active subscription
  const { data: subscription, error: findError } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (findError && findError.code !== "PGRST116") {
    throw new Error(`Error finding subscription: ${findError.message}`);
  }

  if (!subscription || !subscription.id) {
    throw new Error("Không tìm thấy gói đăng ký hoạt động");
  }

  // Mark as canceled
  const { error: updateError } = await supabase
    .from("user_subscriptions")
    .update({ status: "canceled" })
    .eq("id", subscription.id);

  if (updateError) {
    throw new Error(`Error canceling subscription: ${updateError.message}`);
  }

  return {
    success: true,
    message: "Đã hủy gói đăng ký. Gói đăng ký của bạn sẽ còn hiệu lực đến ngày kết thúc hiện tại.",
  };
};
