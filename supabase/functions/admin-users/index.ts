
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
    console.log("Đang kiểm tra quyền admin cho user:", userId);
    
    // Kiểm tra vai trò từ bảng users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .maybeSingle();
      
    if (userError) {
      console.error("Lỗi khi kiểm tra role từ bảng users:", userError);
      return false;
    }
    
    if (userData?.role === 'admin') {
      console.log("Người dùng là admin (từ bảng users)");
      return true;
    }
    
    // Kiểm tra trong bảng user_roles
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
      
    if (roleError) {
      console.error("Lỗi khi kiểm tra role từ bảng user_roles:", roleError);
      return false;
    }
    
    const isUserAdmin = roleData !== null;
    console.log("Kết quả kiểm tra admin từ user_roles:", isUserAdmin);
    return isUserAdmin;
    
  } catch (error) {
    console.error("Lỗi không mong muốn khi kiểm tra quyền admin:", error);
    return false;
  }
}

Deno.serve(async (req) => {
  console.log("Nhận request mới:", req.method, new URL(req.url).pathname);
  
  // Xử lý CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("Xử lý CORS preflight request");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204 
    });
  }
  
  try {
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
      console.error("Thiếu Authorization header");
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
      console.error("JWT token không hợp lệ");
      throw new Error('Invalid JWT token');
    }
    
    console.log("Đã xác thực người dùng:", user.id);
    
    // Kiểm tra xem người dùng có quyền admin không
    const adminStatus = await isAdmin(supabase, user.id);
    
    if (!adminStatus) {
      console.error("Người dùng không có quyền admin:", user.id);
      throw new Error('User is not an admin');
    }
    
    console.log("Xác nhận quyền admin thành công");
    
    let params: FetchUsersParams;
    
    // Xử lý cả GET và POST request
    if (req.method === 'GET') {
      const url = new URL(req.url);
      params = {
        page: Number(url.searchParams.get('page')) || 1,
        pageSize: Number(url.searchParams.get('pageSize')) || 5,
        status: url.searchParams.get('status') || 'all',
        searchTerm: url.searchParams.get('searchTerm') || ''
      };
    } else if (req.method === 'POST') {
      params = await req.json() as FetchUsersParams;
    } else {
      throw new Error(`Unsupported method: ${req.method}`);
    }
    
    console.log("Các tham số truy vấn:", params);
    
    // Truy vấn dữ liệu users với quyền admin, loại trừ các admin
    let query = adminAuthClient
      .from("users")
      .select("*", { count: "exact" })
      .neq("role", "admin")
      .order("created_at", { ascending: false });

    if (params.status !== "all") {
      query = query.eq("status", params.status);
    }

    if (params.searchTerm) {
      query = query
        .or(
          `name.ilike.%${params.searchTerm}%,email.ilike.%${params.searchTerm}%`
        );
    }

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize - 1;
    query = query.range(from, to);

    console.log("Đang thực thi truy vấn users...");
    const { data: users, count, error } = await query;

    if (error) {
      console.error("Lỗi khi truy vấn users:", error);
      throw new Error(`Lỗi khi lấy danh sách người dùng: ${error.message}`);
    }

    console.log(`Đã tìm thấy ${users?.length || 0} người dùng, tổng số: ${count || 0}`);

    if (!users || users.length === 0) {
      return new Response(
        JSON.stringify({
          data: [],
          total: 0
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
    
    // Lấy thông tin gói đăng ký cho từng người dùng
    const usersWithSubscription = await Promise.all(users.map(async (user) => {
      try {
        console.log(`Đang lấy thông tin gói đăng ký cho user ${user.id}`);
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
        console.log(`User ${user.id} có gói đăng ký: ${subscriptionName}`);
        
        return {
          ...user,
          subscription: subscriptionName
        };
      } catch (err) {
        console.error(`Lỗi khi xử lý thông tin người dùng ${user.id}:`, err);
        return user;
      }
    }));

    console.log("Hoàn thành việc lấy thông tin users và gói đăng ký");
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
    
  } catch (error) {
    console.error('Lỗi trong admin-users function:', error);
    
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
