
import { supabase } from "@/integrations/supabase/client";
import { Subscription } from "@/types/subscriptions";
import { parseSubscriptionFeatures } from "./utils";
import type { SubscriptionUpdateResponse, SubscriptionCancelResponse } from "./types";

export const updateUserSubscription = async (userId: string, planId: number): Promise<SubscriptionUpdateResponse> => {
  // Get plan details
  const { data: planData, error: planError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", planId as any) // Chuyển thành any để tránh lỗi type
    .maybeSingle();

  if (planError) throw new Error(`Error fetching plan: ${planError.message}`);
  if (!planData) throw new Error("Plan not found");

  // Type safe features
  const typedPlanData: Subscription = {
    ...(planData as any), // Sử dụng any để tránh lỗi spread type
    features: planData && planData.features ? parseSubscriptionFeatures(planData.features as any) : [],
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
    .eq("user_id", userId as any) // Sử dụng any để tránh lỗi type
    .eq("status", "active" as any)
    .maybeSingle();

  if (subError && subError.code !== "PGRST116") {
    throw new Error(`Error checking existing subscription: ${subError.message}`);
  }

  try {
    // Inactivate old subscription if exists
    if (existingSubscription) {
      const { error: updateError } = await supabase
        .from("user_subscriptions")
        .update({ status: "inactive" } as any)
        .eq("id", existingSubscription && existingSubscription.id ? existingSubscription.id : null);

      if (updateError) throw new Error(`Error updating old subscription: ${updateError.message}`);
    }

    // Create new subscription
    const { error: insertError } = await supabase
      .from("user_subscriptions")
      .insert({
        user_id: userId,
        subscription_id: planId,
        start_date: startDate,
        end_date: endDate,
        status: "active",
      } as any);

    if (insertError) throw new Error(`Error creating subscription: ${insertError.message}`);

    // Record payment
    const { error: paymentError } = await supabase
      .from("payment_history")
      .insert({
        user_id: userId,
        amount: typedPlanData.price,
        status: "success",
        description: `Thanh toán gói ${typedPlanData.name}`,
        payment_at: new Date().toISOString(), // Thêm trường bắt buộc payment_at
      } as any);

    if (paymentError) throw new Error(`Error recording payment: ${paymentError.message}`);

    return {
      success: true,
      message: `Đã nâng cấp lên gói ${typedPlanData.name}`,
    };
  } catch (err) {
    throw err;
  }
};

export const cancelUserSubscription = async (userId: string): Promise<SubscriptionCancelResponse> => {
  // Find active subscription
  const { data: subscription, error: findError } = await supabase
    .from("user_subscriptions")
    .select("id")
    .eq("user_id", userId as any)
    .eq("status", "active" as any)
    .maybeSingle();

  if (findError && findError.code !== "PGRST116") {
    throw new Error(`Error finding subscription: ${findError.message}`);
  }

  if (!subscription) {
    throw new Error("Không tìm thấy gói đăng ký hoạt động");
  }

  // Mark as canceled
  const { error: updateError } = await supabase
    .from("user_subscriptions")
    .update({ status: "canceled" } as any)
    .eq("id", subscription && subscription.id ? subscription.id : null);

  if (updateError) {
    throw new Error(`Error canceling subscription: ${updateError.message}`);
  }

  return {
    success: true,
    message: "Đã hủy gói đăng ký. Gói đăng ký của bạn sẽ còn hiệu lực đến ngày kết thúc hiện tại.",
  };
};
