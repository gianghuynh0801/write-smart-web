
// Re-export toàn bộ API để đảm bảo backward compatibility
export * from "./userParser";
export * from "./userQueries";
export * from "./userMutations";
export * from "./userCredits";
export * from "./userSubscription";

import { supabase } from "@/integrations/supabase/client";
import { User, UserFormValues } from "@/types/user";
import { createUserSubscriptionAsAdmin, getUserActiveSubscription } from "./admin";
import { handleSubscriptionChange } from "./userSubscription";
