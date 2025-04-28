
import type { Database } from "@/integrations/supabase/types";

// Helper types
export type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];
export type UserSubscriptionRow = Database["public"]["Tables"]["user_subscriptions"]["Row"];

// Response types
export interface SubscriptionUpdateResponse {
  success: boolean;
  message: string;
}

export interface SubscriptionCancelResponse {
  success: boolean;
  message: string;
}
