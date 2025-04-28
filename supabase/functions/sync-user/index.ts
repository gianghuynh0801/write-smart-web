
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

const supabaseUrl = "https://lxhawtndkubaeljbaylp.supabase.co"
const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

Deno.serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Phân tích body request
  const requestData = await req.json()
  const { user_id, email, name, email_verified } = requestData

  // Kiểm tra thông tin cần thiết
  if (!user_id || !email || !name) {
    return new Response(
      JSON.stringify({ error: 'Thiếu thông tin người dùng cần thiết' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  try {
    console.log(`[sync-user] Bắt đầu đồng bộ dữ liệu cho người dùng: ${user_id}`);

    // Kiểm tra xem người dùng đã tồn tại chưa
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', user_id)
      .maybeSingle();
    
    if (checkError) {
      console.log('[sync-user] Lỗi khi kiểm tra người dùng:', checkError);
      // Không throw error ở đây, vẫn tiếp tục thử tạo người dùng
    }
    
    let userData = null;
    
    // Nếu người dùng chưa tồn tại, tạo mới
    if (!existingUser) {
      console.log('[sync-user] Người dùng chưa tồn tại, đang tạo mới');
      
      // Tạo người dùng mới với thông tin cơ bản
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: user_id,
            email: email,
            name: name,
            email_verified: email_verified !== undefined ? email_verified : false,
            avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
            credits: 10,
            role: 'user',
            status: 'active',
            subscription: 'Cơ bản' // Mặc định gán gói Cơ bản
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('[sync-user] Lỗi khi tạo người dùng:', insertError);
        throw insertError;
      }
      
      userData = newUser;
      console.log('[sync-user] Đã tạo người dùng thành công:', userData);
      
      // Đợi ngắn để đảm bảo user đã được tạo xong
      await new Promise(resolve => setTimeout(resolve, 500));
    } else {
      console.log('[sync-user] Người dùng đã tồn tại');
      userData = existingUser;
    }

    // Tạo gói đăng ký cơ bản - trong block try-catch riêng
    // để đảm bảo không ảnh hưởng đến quá trình tạo user nếu lỗi
    try {
      console.log('[sync-user] Đang tạo gói đăng ký cơ bản');
      
      // Kiểm tra xem người dùng đã có gói đăng ký chưa
      const { data: existingSub, error: checkSubError } = await supabaseAdmin
        .from('user_subscriptions')
        .select('id')
        .eq('user_id', user_id)
        .maybeSingle();
      
      if (checkSubError) {
        console.log('[sync-user] Lỗi khi kiểm tra gói đăng ký:', checkSubError);
      }
      
      // Chỉ tạo gói đăng ký nếu chưa có
      if (!existingSub) {
        // Lấy ID của gói Cơ bản
        const { data: basicSub, error: basicSubError } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('name', 'Cơ bản')
          .maybeSingle();

        if (basicSubError) {
          console.error('[sync-user] Lỗi khi tìm gói Cơ bản:', basicSubError);
          throw basicSubError;
        }

        if (!basicSub) {
          console.error('[sync-user] Không tìm thấy gói Cơ bản');
          throw new Error('Không tìm thấy gói đăng ký Cơ bản');
        }

        console.log('[sync-user] Đã tìm thấy gói Cơ bản, ID:', basicSub.id);

        const startDate = new Date().toISOString().split('T')[0];
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        const endDateStr = endDate.toISOString().split('T')[0];

        // Tạo subscription cho user
        const { data: newSub, error: subError } = await supabaseAdmin
          .from('user_subscriptions')
          .insert({
            user_id: user_id,
            subscription_id: basicSub.id,
            start_date: startDate,
            end_date: endDateStr,
            status: 'active'
          })
          .select();

        if (subError) {
          console.error('[sync-user] Lỗi khi tạo gói đăng ký:', subError);
          throw subError;
        }

        console.log('[sync-user] Đã tạo gói đăng ký thành công:', newSub);
      } else {
        console.log('[sync-user] Người dùng đã có gói đăng ký');
      }
    } catch (subError) {
      // Xử lý lỗi tạo subscription nhưng vẫn trả về thành công cho việc tạo user
      console.error('[sync-user] Lỗi xử lý subscription nhưng user đã được tạo:', subError);
      return new Response(
        JSON.stringify({ 
          message: 'Đồng bộ thành công nhưng có lỗi khi tạo gói đăng ký', 
          data: userData,
          warning: 'Có lỗi xảy ra khi cấu hình gói đăng ký' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ 
        message: 'Đồng bộ thành công', 
        data: userData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('[sync-user] Lỗi xử lý:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Lỗi không xác định khi đồng bộ dữ liệu người dùng' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
