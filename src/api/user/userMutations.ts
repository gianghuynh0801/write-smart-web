
import { supabase } from "@/integrations/supabase/client";
import { parseUser } from "./userParser";
import { User, UserFormValues } from "@/types/user";
import { createUserSubscriptionAsAdmin } from "./adminOperations";
import { handleSubscriptionChange } from "./userSubscription";
import { getUserById } from "./userQueries";

export const createUser = async (userData: UserFormValues): Promise<User> => {
  const newId = crypto.randomUUID();
  const { data, error } = await supabase.from("users").insert([
    {
      id: newId,
      name: userData.name,
      email: userData.email,
      credits: userData.credits,
      status: userData.status,
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
      role: userData.role
    }
  ]).select().single();

  if (error) throw new Error(error.message);
  
  const createdUser = parseUser(data);

  if (
    userData.subscription &&
    userData.subscription !== "Không có" &&
    userData.subscription !== "Cơ bản"
  ) {
    try {
      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("name", userData.subscription)
        .maybeSingle();
      
      if (subscriptionData) {
        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        const endDateStr = endDate.toISOString().split('T')[0];
        
        await createUserSubscriptionAsAdmin(
          newId,
          subscriptionData.id,
          startDate,
          endDateStr
        );
      }
    } catch (subError) {
      console.error("Could not update subscription info:", subError);
      throw new Error(`Could not create subscription: ${subError instanceof Error ? subError.message : String(subError)}`);
    }
  }

  createdUser.subscription = userData.subscription;
  return createdUser;
};

export const updateUser = async (id: string | number, userData: UserFormValues): Promise<User> => {
  const userId = String(id);
  const currentUser = await getUserById(userId);
  
  const { data, error } = await supabase
    .from("users")
    .update({
      name: userData.name,
      email: userData.email,
      credits: userData.credits,
      status: userData.status,
      role: userData.role
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  const updatedUser = parseUser(data);
  
  if (currentUser && currentUser.subscription !== userData.subscription) {
    try {
      const result = await handleSubscriptionChange(userId, userData.subscription);
      
      if (!result.success) {
        console.error("Lỗi khi thay đổi gói đăng ký:", result.message);
      }
    } catch (error) {
      console.error("Error updating subscription:", error);
    }
  }

  updatedUser.subscription = userData.subscription;
  return updatedUser;
};

export const deleteUser = async (id: string | number): Promise<void> => {
  const userId = String(id);
  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) throw new Error(error.message);
};
