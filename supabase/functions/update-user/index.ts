
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

const standardResponse = (data: any = null, error: string | null = null, status = 200) => {
  return new Response(
    JSON.stringify({ data, error }), 
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status
    }
  )
}

// Thêm timeout cho các database queries
const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number, operationName: string): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Timeout khi thực hiện: ${operationName}`)), timeoutMs);
  });
  
  try {
    return await Promise.race([promise, timeoutPromise]);
  } catch (error) {
    if ((error as Error).message.includes('Timeout')) {
      console.error(`[update-user] ${(error as Error).message}`);
    }
    throw error;
  }
};

// Function để kiểm tra quyền admin dựa trên user_roles
async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    console.log('[update-user] Kiểm tra quyền admin cho user:', userId);
    
    const roleCheckPromise = supabaseAdmin
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();
    
    const { data: roleData, error: roleError } = await withTimeout(
      roleCheckPromise, 
      5000, 
      'Kiểm tra quyền admin'
    );

    if (roleError) {
      console.error('[update-user] Lỗi khi kiểm tra user_roles:', roleError);
      return false;
    }

    return !!roleData;
  } catch (error) {
    console.error('[update-user] Lỗi không mong đợi trong checkIsAdmin:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[update-user] Nhận request mới')
    
    // Xác thực người dùng
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[update-user] Thiếu Authorization header')
      return standardResponse(null, 'Thiếu thông tin xác thực', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('[update-user] Đang xác thực token')
    
    const authPromise = supabaseAdmin.auth.getUser(token);
    const { data: { user: caller }, error: authError } = await withTimeout(
      authPromise,
      5000,
      'Xác thực người dùng'
    );
    
    if (authError || !caller) {
      console.error('[update-user] Lỗi xác thực:', authError)
      return standardResponse(
        null, 
        `Xác thực không thành công: ${authError?.message || 'Token không hợp lệ'}`,
        401
      )
    }

    console.log('[update-user] Xác thực thành công cho user:', caller.id)

    // Kiểm tra quyền admin
    const isAdmin = await checkIsAdmin(caller.id);
    if (!isAdmin) {
      console.error('[update-user] Người dùng không có quyền admin:', caller.id);
      return standardResponse(
        null,
        'Bạn không có quyền thực hiện thao tác này',
        403
      );
    }

    // Lấy dữ liệu từ request
    let requestData;
    try {
      requestData = await req.json();
    } catch (parseError) {
      console.error('[update-user] Lỗi khi parse dữ liệu request:', parseError);
      return standardResponse(
        null,
        'Dữ liệu request không hợp lệ',
        400
      );
    }
    
    const { id, userData } = requestData;
    
    if (!id || !userData) {
      console.error('[update-user] Thiếu thông tin cần thiết:', requestData);
      return standardResponse(
        null,
        'Thiếu thông tin người dùng cần cập nhật',
        400
      );
    }

    console.log("[update-user] Đang cập nhật user:", { id, userData });

    // Kiểm tra user tồn tại
    const getUserPromise = supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    const { data: existingUser, error: getUserError } = await withTimeout(
      getUserPromise,
      5000,
      'Kiểm tra user tồn tại'
    );

    if (getUserError) {
      console.error('[update-user] Lỗi khi kiểm tra user:', getUserError);
      return standardResponse(
        null,
        `Lỗi khi kiểm tra người dùng: ${getUserError.message}`,
        500
      );
    }

    if (!existingUser) {
      console.error('[update-user] Không tìm thấy user:', id);
      return standardResponse(
        null,
        'Không tìm thấy người dùng',
        404
      );
    }

    // Lưu thông tin subscription trước để xử lý riêng
    const oldSubscription = existingUser.subscription;
    const newSubscription = userData.subscription;
    const subscriptionChanged = oldSubscription !== newSubscription;

    // Cập nhật thông tin user
    const updatePromise = supabaseAdmin
      .from('users')
      .update({
        name: userData.name,
        email: userData.email,
        credits: userData.credits,
        status: userData.status,
        role: userData.role,
        subscription: userData.subscription
      })
      .eq('id', id)
      .select()
      .single();
    
    const { data: updatedUser, error: updateError } = await withTimeout(
      updatePromise,
      8000,
      'Cập nhật thông tin user'
    );

    if (updateError) {
      console.error('[update-user] Lỗi khi cập nhật:', updateError);
      return standardResponse(
        null,
        `Lỗi cập nhật: ${updateError.message}`,
        500
      );
    }

    // Xử lý thay đổi gói đăng ký trong background để không chặn response
    if (subscriptionChanged) {
      try {
        console.log('[update-user] Phát hiện thay đổi gói đăng ký:', {
          from: oldSubscription,
          to: newSubscription
        });
        
        // Sử dụng EdgeRuntime.waitUntil để xử lý subscription trong background
        if (typeof EdgeRuntime !== 'undefined') {
          EdgeRuntime.waitUntil((async () => {
            try {
              await updateUserSubscription(id, newSubscription);
              console.log('[update-user] Đã cập nhật gói đăng ký thành công trong background');
            } catch (err) {
              console.error('[update-user] Lỗi khi cập nhật gói đăng ký trong background:', err);
            }
          })());
          
          console.log('[update-user] Đã gửi cập nhật gói đăng ký để xử lý trong background');
        } else {
          // Không block response, trả về trước và xử lý sau
          console.log('[update-user] EdgeRuntime.waitUntil không khả dụng, xử lý đồng bộ');
          setTimeout(async () => {
            try {
              await updateUserSubscription(id, newSubscription);
              console.log('[update-user] Đã cập nhật gói đăng ký thành công (async)');
            } catch (err) {
              console.error('[update-user] Lỗi khi cập nhật gói đăng ký (async):', err);
            }
          }, 0);
        }
      } catch (subProcessError) {
        console.error('[update-user] Lỗi khi khởi tạo xử lý gói đăng ký:', subProcessError);
        // Không ảnh hưởng đến response chính, chỉ log lỗi
      }
    }

    // Trả về kết quả thành công
    console.log('[update-user] Cập nhật thành công, đang trả về kết quả');
    return standardResponse(updatedUser, null, 200);

  } catch (error) {
    console.error('[update-user] Lỗi không mong đợi:', error);
    return standardResponse(
      null,
      error instanceof Error ? error.message : String(error),
      500
    );
  }
});

// Hàm xử lý cập nhật gói đăng ký - đã tối ưu để không block main thread
async function updateUserSubscription(userId: string, subscriptionName: string): Promise<void> {
  try {
    const timeoutMs = 5000;

    // Tìm subscription id
    const subscriptionPromise = supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('name', subscriptionName)
      .maybeSingle();
      
    const { data: subscriptionData, error: subError } = await withTimeout(
      subscriptionPromise,
      timeoutMs,
      'Tìm gói đăng ký'
    );

    if (subError) {
      throw new Error(`Lỗi khi tìm gói đăng ký: ${subError.message}`);
    }

    // Hủy các gói đăng ký cũ
    const deactivatePromise = supabaseAdmin
      .from('user_subscriptions')
      .update({ status: 'inactive' })
      .eq('user_id', userId)
      .eq('status', 'active');
    
    await withTimeout(
      deactivatePromise,
      timeoutMs,
      'Hủy gói đăng ký cũ'
    );

    // Tạo gói đăng ký mới nếu không phải "Không có" và tìm thấy subscription
    if (subscriptionName !== 'Không có' && subscriptionData) {
      const startDate = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      const endDateStr = endDate.toISOString().split('T')[0];

      const insertPromise = supabaseAdmin
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          subscription_id: subscriptionData.id,
          start_date: startDate,
          end_date: endDateStr,
          status: 'active'
        });
      
      await withTimeout(
        insertPromise,
        timeoutMs,
        'Tạo gói đăng ký mới'
      );
    }
  } catch (error) {
    console.error('[update-user] Lỗi khi xử lý gói đăng ký:', error);
    throw error;
  }
}
