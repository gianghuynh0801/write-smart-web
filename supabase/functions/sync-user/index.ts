
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
    console.log(`[sync-user] Đồng bộ dữ liệu cho người dùng: ${user_id}`);
    
    // Kiểm tra xem người dùng đã tồn tại chưa
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user_id)
      .maybeSingle();
      
    if (getUserError) {
      console.error('[sync-user] Lỗi khi kiểm tra người dùng:', getUserError);
      throw getUserError;
    }
    
    let userData;
    
    if (!existingUser) {
      console.log('[sync-user] Người dùng chưa tồn tại, tiến hành tạo mới');
      
      // Tạo người dùng mới
      const { data: newUser, error: insertError } = await supabaseAdmin.from('users').insert([
        {
          id: user_id,
          email: email,
          name: name,
          email_verified: email_verified !== undefined ? email_verified : false,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          credits: 10,
          role: 'user',
          status: 'active'
        }
      ]).select().single();
      
      if (insertError) {
        console.error('[sync-user] Lỗi khi tạo người dùng mới:', insertError);
        throw insertError;
      }
      
      userData = newUser;
      
      // Kiểm tra xem bảng subscriptions có tồn tại không
      try {
        // Kiểm tra bảng subscriptions có tồn tại không
        const { data: tableExists } = await supabaseAdmin.rpc('check_table_exists', {
          table_name: 'subscriptions'
        });
        
        console.log('[sync-user] Kiểm tra bảng subscriptions:', tableExists);
        
        if (tableExists) {
          // Khởi tạo gói đăng ký cơ bản cho người dùng mới
          const { data: subscriptionData, error: subQueryError } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('name', 'Cơ bản')
            .maybeSingle();
          
          if (subQueryError) {
            console.error('[sync-user] Lỗi khi truy vấn gói đăng ký:', subQueryError);
          }
          else if (subscriptionData) {
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            const endDateStr = endDate.toISOString().split('T')[0];
            
            const { data: userSub, error: subInsertError } = await supabaseAdmin
              .from('user_subscriptions')
              .insert({
                user_id: user_id,
                subscription_id: subscriptionData.id,
                start_date: startDate,
                end_date: endDateStr,
                status: 'active'
              });
            
            if (subInsertError) {
              console.error('[sync-user] Lỗi khi tạo gói đăng ký cơ bản:', subInsertError);
            } else {
              console.log('[sync-user] Đã tạo gói đăng ký cơ bản thành công');
              
              // Cập nhật trường subscription trong bảng users
              const { error: updateSubError } = await supabaseAdmin
                .from('users')
                .update({ subscription: 'Cơ bản' })
                .eq('id', user_id);
                
              if (updateSubError) {
                console.error('[sync-user] Lỗi khi cập nhật trường subscription:', updateSubError);
              } else {
                console.log('[sync-user] Đã cập nhật trường subscription thành công');
              }
            }
          }
        } else {
          console.log('[sync-user] Bảng subscriptions không tồn tại, bỏ qua quá trình tạo gói đăng ký');
        }
      } catch (subError) {
        console.error('[sync-user] Lỗi trong quá trình tạo gói đăng ký:', subError);
        // Tiếp tục mà không ném lỗi
      }
    } else {
      console.log('[sync-user] Người dùng đã tồn tại, tiến hành cập nhật');
      
      // Cập nhật thông tin người dùng
      const { data: updatedUser, error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          email: email,
          name: name,
          email_verified: email_verified !== undefined ? email_verified : existingUser.email_verified
        })
        .eq('id', user_id)
        .select()
        .single();
      
      if (updateError) {
        console.error('[sync-user] Lỗi khi cập nhật thông tin người dùng:', updateError);
        throw updateError;
      }
      
      userData = updatedUser;
    }
    
    return new Response(
      JSON.stringify({ message: 'Đồng bộ thành công', data: userData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('[sync-user] Lỗi xử lý:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Lỗi không xác định khi đồng bộ dữ liệu người dùng' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

// Tạo hàm RPC kiểm tra bảng có tồn tại không
const createCheckTableFunction = async () => {
  try {
    const { error } = await supabaseAdmin.rpc('create_check_table_function');
    if (error) console.error('Lỗi khi tạo hàm check_table_exists:', error);
  } catch (e) {
    console.error('Không thể tạo hàm check_table_exists:', e);
  }
};

// Thực hiện tạo hàm khi edge function khởi động
createCheckTableFunction();
