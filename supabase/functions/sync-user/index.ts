
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SyncUserRequest {
  user_id: string;
  email: string;
  name?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, email, name } = await req.json() as SyncUserRequest;
    
    if (!user_id || !email) {
      throw new Error("Missing required parameters: user_id and email");
    }

    console.log(`Syncing user data for user ID: ${user_id}, email: ${email}`);
    
    // Create Supabase admin client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Try to find the user in auth.users first
    let authUserExists = false;
    try {
      const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(user_id);

      if (!authUserError && authUser?.user) {
        authUserExists = true;
        console.log(`Confirmed user exists in auth system: ${user_id}`);
      } else {
        console.log(`User not found in auth system, error: ${authUserError?.message}`);
        // Instead of throwing an error, we'll try to proceed with creation in case the auth record exists 
        // but something went wrong with the admin API call
      }
    } catch (authError) {
      console.error("Error checking auth user:", authError);
      // Continue anyway to try to create the user record
    }

    // Check if user exists in public.users
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user_id)
      .maybeSingle();

    if (existingUserError) {
      console.error("Error checking for existing user:", existingUserError);
      // Continue anyway as we'll try to create/update the user
    }

    // Create or update user record
    let operation;
    if (!existingUser) {
      // Create new user record
      console.log(`Creating user record in database for: ${user_id}`);
      operation = supabaseAdmin
        .from('users')
        .insert({
          id: user_id,
          email: email,
          name: name || email.split('@')[0],
          status: 'inactive',
          email_verified: false,
          role: 'user',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } else {
      // Update existing user
      console.log(`User ${user_id} already exists, updating information`);
      operation = supabaseAdmin
        .from('users')
        .update({
          email: email,
          name: name || existingUser.name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user_id);
    }

    const { error: operationError } = await operation;
    if (operationError) {
      console.error("Error creating/updating user record:", operationError);
      throw operationError;
    }

    console.log(`User record operation successful for ${user_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User synchronized successfully",
        user_id: user_id,
        is_new: !existingUser,
        auth_user_exists: authUserExists
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error syncing user:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error.message,
        details: error.toString()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
