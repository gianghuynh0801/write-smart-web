
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.43.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Xử lý CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("Xử lý CORS preflight request");
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables');
    }

    // Parse request
    const { userId } = await req.json();
    console.log("Đang lấy thông tin chi tiết cho user:", userId);

    if (!userId) {
      throw new Error('Missing user ID');
    }

    // Khởi tạo Supabase client với service role key
    const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey);

    // Lấy thông tin user từ bảng users
    console.log("Đang truy vấn thông tin user...");
    const { data: userData, error: userError } = await adminAuthClient
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error("Lỗi khi lấy thông tin user:", userError);
      throw new Error(`Không thể lấy thông tin user: ${userError.message}`);
    }

    if (!userData) {
      console.log("Không tìm thấy user với ID:", userId);
      throw new Error('User không tồn tại');
    }

    // Lấy thông tin gói đăng ký hiện tại
    console.log("Đang lấy thông tin gói đăng ký...");
    const { data: subData, error: subError } = await adminAuthClient
      .from('user_subscriptions')
      .select(`
        subscription_id,
        status,
        subscriptions (
          name
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle();

    if (subError) {
      console.error("Lỗi khi lấy thông tin gói đăng ký:", subError);
    }

    // Kết hợp thông tin
    const userWithSubscription = {
      ...userData,
      subscription: subData?.subscriptions?.name || "Không có"
    };

    console.log("Đã lấy thông tin chi tiết thành công:", userWithSubscription);

    return new Response(
      JSON.stringify(userWithSubscription),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Lỗi khi xử lý request:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message.includes('User không tồn tại') ? 404 : 500
      }
    );
  }
});
