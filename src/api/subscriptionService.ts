
// Đã sửa: dùng đúng supabase client typed và types
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Subscription, UserSubscription } from "@/types/subscriptions";

// Helper types
type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
type UserSubscriptionRow = Database["public"]["Tables"]["user_subscriptions"]["Row"];
type PaymentHistoryRow = Database["public"]["Tables"]["payment_history"]["Row"];

// Fetch all subscription plans
export const fetchSubscriptionPlans = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .order("price", { ascending: true });

  if (error) throw new Error(`Error fetching subscription plans: ${error.message}`);

  // Cast features JSON to string[] | null
  return (data || []).map((row) => ({
    ...row,
    features: Array.isArray(row.features)
      ? (row.features as string[])
      : typeof row.features === "string"
        ? JSON.parse(row.features)
        : row.features === null || row.features === undefined ? null : row.features,
  })) as Subscription[];
};

// Fetch current user subscription
export const fetchUserSubscription = async (userId: string) => {
  // First try to get the active subscription from user_subscriptions table
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select(`
      id,
      user_id,
      start_date,
      end_date,
      status,
      subscriptions:subscription_id (
        id,
        name,
        price,
        period,
        features
      )
    `)
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching user subscription:", error);
    throw new Error(`Error fetching subscription: ${error.message}`);
  }

  if (data) {
    const typedData = data as unknown as UserSubscription & {
      subscriptions?: Subscription;
    };
    return {
      plan: typedData.subscriptions?.name || "Không có",
      planId: typedData.subscriptions?.id,
      status: typedData.status,
      startDate: typedData.start_date,
      endDate: typedData.end_date,
      price: typedData.subscriptions?.price || 0,
      usageArticles: 8, // Giả lập
      totalArticles: 30, // Giả lập
    };
  }

  return {
    plan: "Không có",
    planId: null,
    status: "inactive",
    startDate: "",
    endDate: "",
    price: 0,
    usageArticles: 0,
    totalArticles: 0,
  };
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

