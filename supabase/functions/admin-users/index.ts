
// Follow this setup guide to integrate the Deno runtime into your project:
// https://deno.com/manual/getting_started/javascript_runtime
// Learn more about Deno: https://deno.com/runtime

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FetchUsersParams {
  page: number;
  pageSize: number;
  status?: string;
  searchTerm?: string;
}

// Kiểm tra xem người dùng có phải là admin hay không
async function isAdmin(supabase, userId) {
  try {
    // Kiểm tra vai trò từ bảng users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
      
    if (!userError && userData?.role === 'admin') {
      return true;
    }
    
    // Kiểm tra trong bảng user_roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
      
    return roleData !== null && !roleError;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Xử lý CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    // Lấy URL của Supabase và Service Role Key từ các biến môi trường
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    }
    
    // Tạo client Supabase với quyền service_role (Admin)
    const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Tạo client Supabase dựa trên JWT của người dùng để kiểm tra quyền admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    const jwt = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    // Lấy ID người dùng từ JWT
    const {data: {user}} = await supabase.auth.getUser(jwt);
    
    if (!user) {
      throw new Error('Invalid JWT token');
    }
    
    // Kiểm tra xem người dùng có quyền admin không
    const adminStatus = await isAdmin(supabase, user.id);
    
    if (!adminStatus) {
      throw new Error('User is not an admin');
    }
    
    // Phân tích request để lấy các tham số
    const { pathname } = new URL(req.url);
    
    // Phân tích phương thức và đường dẫn để xác định hành động
    if (req.method === 'POST') {
      if (pathname.endsWith('/fetch-users')) {
        const { page = 1, pageSize = 5, status = 'all', searchTerm = '' } = await req.json() as FetchUsersParams;
        
        console.log("Admin fetch users:", { page, pageSize, status, searchTerm });
        
        // Truy vấn dữ liệu users với quyền admin
        let query = adminAuthClient
          .from("users")
          .select("*", { count: "exact" })
          .order("created_at", { ascending: false });
    
        if (status !== "all") {
          query = query.eq("status", status);
        }
    
        if (searchTerm) {
          query = query
            .or(
              `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
            );
        }
    
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);
    
        const { data: users, count, error } = await query;
    
        if (error) {
          throw new Error(`Error fetching users: ${error.message}`);
        }
        
        // Lấy thông tin gói đăng ký cho từng người dùng
        const usersWithSubscription = await Promise.all((users || []).map(async (user) => {
          try {
            const { data: subData } = await adminAuthClient
              .from("user_subscriptions")
              .select(`
                subscription_id,
                status,
                subscriptions (
                  name
                )
              `)
              .eq("user_id", user.id)
              .eq("status", "active")
              .maybeSingle();
              
            const subscriptionName = subData?.subscriptions?.name || "Không có";
            
            return {
              ...user,
              subscription: subscriptionName
            };
          } catch (err) {
            console.error(`Error processing user ${user.id}:`, err);
            return user;
          }
        }));
    
        return new Response(
          JSON.stringify({
            data: usersWithSubscription,
            total: count || 0
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            },
            status: 200 
          }
        );
      }
    }
    
    // Nếu không khớp với bất kỳ endpoint nào
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 404 
      }
    );
    
  } catch (error) {
    console.error('Error in admin-users function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: error.message.includes('not an admin') ? 403 : 500
      }
    );
  }
});
