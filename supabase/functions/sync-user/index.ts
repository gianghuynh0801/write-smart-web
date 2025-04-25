
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
    
    // Create Supabase admin client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists in auth.users
    const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (authUserError || !authUser.user) {
      console.error("User not found in auth.users:", authUserError);
      throw new Error(`User not found in authentication system: ${authUserError?.message || "Unknown error"}`);
    }

    console.log(`Confirmed user exists in auth system: ${user_id}`);

    // Check if user exists in public.users
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user_id)
      .maybeSingle();

    if (existingUserError) {
      console.error("Error checking for existing user:", existingUserError);
      throw existingUserError;
    }

    if (!existingUser) {
      // Create user record in public.users
      console.log(`Creating user record in database for: ${user_id}`);
      const { error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          id: user_id,
          email: email,
          name: name || email.split('@')[0],
          status: 'inactive',
          email_verified: false,
          role: 'user'
        });

      if (createError) {
        console.error("Error creating user record:", createError);
        throw createError;
      }

      console.log(`User record created successfully for ${user_id}`);
    } else {
      console.log(`User ${user_id} already exists in the database, no need to create`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "User synchronized successfully" 
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
