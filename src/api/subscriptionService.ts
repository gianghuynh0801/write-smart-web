
import { supabase } from "@/integrations/supabase/client";
import { Subscription, UserSubscription } from "@/types/subscriptions";

// Fetch all subscription plans
export const fetchSubscriptionPlans = async (): Promise<Subscription[]> => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .order('price', { ascending: true });
    
  if (error) throw new Error(`Error fetching subscription plans: ${error.message}`);
  return data as Subscription[] || [];
};

// Fetch current user subscription
export const fetchUserSubscription = async (userId: string) => {
  // First try to get the active subscription from user_subscriptions table
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      id,
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
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
    console.error("Error fetching user subscription:", error);
    throw new Error(`Error fetching subscription: ${error.message}`);
  }

  // If subscription found in user_subscriptions
  if (data) {
    // Type assertion for the data
    const typedData = data as unknown as UserSubscription;
    return {
      plan: typedData.subscriptions?.name || "Không có",
      planId: typedData.subscriptions?.id,
      status: typedData.status,
      startDate: typedData.start_date,
      endDate: typedData.end_date,
      price: typedData.subscriptions?.price || 0,
      usageArticles: 8, // This would come from a usage tracking system
      totalArticles: 30 // This should be extracted from features or a separate limit table
    };
  }

  // If no active subscription found, return default values
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
};

// Update user subscription
export const updateUserSubscription = async (userId: string, planId: number) => {
  // Get the plan details
  const { data: planData, error: planError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', planId)
    .single();
  
  if (planError) throw new Error(`Error fetching plan: ${planError.message}`);
  if (!planData) throw new Error("Plan not found");
  
  // Safely type the plan data
  const typedPlanData = planData as unknown as Subscription;
  
  // Calculate subscription dates
  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription
  const endDateStr = endDate.toISOString().split('T')[0];
  
  // Check if user already has an active subscription
  const { data: existingSubscription, error: subError } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  
  if (subError && subError.code !== 'PGRST116') {
    throw new Error(`Error checking existing subscription: ${subError.message}`);
  }
  
  try {
    // Begin transaction manually with separate queries
    // We'll use individual queries instead of RPC to avoid type issues
    
    // If user has existing subscription, mark it as inactive
    if (existingSubscription) {
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ status: 'inactive' })
        .eq('id', existingSubscription.id);
      
      if (updateError) throw new Error(`Error updating old subscription: ${updateError.message}`);
    }
    
    // Create new subscription
    const { error: insertError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        subscription_id: planId,
        start_date: startDate,
        end_date: endDateStr,
        status: 'active'
      });
    
    if (insertError) throw new Error(`Error creating subscription: ${insertError.message}`);
    
    // Record payment
    const { error: paymentError } = await supabase
      .from('payment_history')
      .insert({
        user_id: userId,
        amount: typedPlanData.price,
        status: 'success',
        description: `Thanh toán gói ${typedPlanData.name}`
      });
    
    if (paymentError) throw new Error(`Error recording payment: ${paymentError.message}`);
    
    return {
      success: true,
      message: `Đã nâng cấp lên gói ${typedPlanData.name}`
    };
  } catch (error) {
    throw error;
  }
};

// Cancel user subscription
export const cancelUserSubscription = async (userId: string) => {
  // Find active subscription
  const { data: subscription, error: findError } = await supabase
    .from('user_subscriptions')
    .select('id')
    .eq('user_id', userId)
    .eq('status', 'active')
    .maybeSingle();
  
  if (findError && findError.code !== 'PGRST116') {
    throw new Error(`Error finding subscription: ${findError.message}`);
  }
  
  if (!subscription) {
    throw new Error("Không tìm thấy gói đăng ký hoạt động");
  }
  
  // Mark subscription as canceled but still active until end date
  const { error: updateError } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'canceled'
    })
    .eq('id', subscription.id);
  
  if (updateError) {
    throw new Error(`Error canceling subscription: ${updateError.message}`);
  }
  
  return {
    success: true,
    message: "Đã hủy gói đăng ký. Gói đăng ký của bạn sẽ còn hiệu lực đến ngày kết thúc hiện tại."
  };
};
