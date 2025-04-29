
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

// Cache cho kết quả truy vấn để tránh truy vấn lặp lại
const queryCache = new Map();
const CACHE_TTL = 60 * 1000; // 1 phút

// Hàm truy vấn có cache
async function cachedQuery(cacheKey: string, queryFn: () => Promise<any>) {
  const now = Date.now();
  const cachedResult = queryCache.get(cacheKey);
  
  if (cachedResult && now - cachedResult.timestamp < CACHE_TTL) {
    console.log(`[sync-user] Sử dụng kết quả cache cho ${cacheKey}`);
    return cachedResult.data;
  }
  
  const result = await queryFn();
  queryCache.set(cacheKey, { data: result, timestamp: now });
  return result;
}

// Tối ưu hóa retry với backoff
async function retryOperation<T>(
  operation: () => Promise<T>, 
  maxAttempts: number = 3,
  baseDelay: number = 500
): Promise<T> {
  let attempt = 1;
  
  while (true) {
    try {
      return await operation();
    } catch (error) {
      if (attempt >= maxAttempts) {
        throw error;
      }
      
      const delay = Math.min(baseDelay * Math.pow(1.5, attempt - 1), 5000);
      console.log(`[sync-user] Lỗi, thử lại sau ${delay}ms (lần ${attempt}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, delay));
      attempt++;
    }
  }
}

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
      JSON.stringify({ 
        success: false,
        message: 'Thiếu thông tin người dùng cần thiết',
        warnings: ['Yêu cầu thiếu thông tin: user_id, email và name là bắt buộc'] 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  try {
    console.log(`[sync-user] Bắt đầu đồng bộ dữ liệu cho người dùng: ${user_id}`);

    // Kiểm tra xem người dùng đã tồn tại chưa - dùng cache nếu có thể
    const { data: existingUser } = await cachedQuery(
      `user_${user_id}`,
      () => supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', user_id)
        .maybeSingle()
    );
    
    let userData = null;
    let userCreated = false;
    let warnings = [];
    
    // Nếu người dùng chưa tồn tại, tạo mới
    if (!existingUser) {
      console.log('[sync-user] Người dùng chưa tồn tại, đang tạo mới');
      
      try {
        // Tạo người dùng mới với thông tin cơ bản - sử dụng retry logic
        const { data: newUser, error: insertError } = await retryOperation(
          () => supabaseAdmin
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
                subscription: 'Cơ bản'
              }
            ])
            .select()
            .single(),
          4  // Giảm số lần thử xuống 4
        );
        
        if (insertError) {
          if (insertError.message.includes('duplicate') || insertError.message.includes('already exists')) {
            // Kiểm tra lại người dùng nếu gặp lỗi trùng lặp
            const { data: existingUserRetry } = await supabaseAdmin
              .from('users')
              .select('*')
              .eq('id', user_id)
              .maybeSingle();
              
            if (existingUserRetry) {
              userData = existingUserRetry;
              userCreated = false;
              console.log('[sync-user] Đã xác nhận user tồn tại:', existingUserRetry);
            } else {
              throw insertError;
            }
          } else {
            throw insertError;
          }
        } else {
          userData = newUser;
          userCreated = true;
        }
      } catch (createError) {
        console.error('[sync-user] Lỗi khi tạo người dùng:', createError);
        throw createError;
      }
    } else {
      console.log('[sync-user] Người dùng đã tồn tại, id:', existingUser.id);
      userData = existingUser;
      userCreated = false;
    }

    // Kiểm tra và tạo gói đăng ký cơ bản nếu cần
    try {
      console.log('[sync-user] Đang kiểm tra gói đăng ký cho người dùng');
      
      // Kiểm tra xem bảng subscriptions có tồn tại không - sử dụng cache
      const { data: tableExists } = await cachedQuery(
        'check_subscriptions_table',
        () => supabaseAdmin.rpc('check_table_exists', { table_name: 'subscriptions' })
      );
      
      if (!tableExists) {
        console.warn('[sync-user] Bảng subscriptions không tồn tại');
        warnings.push('Bảng subscriptions không tồn tại, không thể tạo gói đăng ký');
      } else {
        // Kiểm tra xem người dùng đã có gói đăng ký chưa
        const { data: existingSub, error: checkSubError } = await supabaseAdmin
          .from('user_subscriptions')
          .select('id')
          .eq('user_id', user_id)
          .maybeSingle();
        
        if (checkSubError) {
          console.log('[sync-user] Lỗi khi kiểm tra gói đăng ký:', checkSubError);
          warnings.push(`Lỗi khi kiểm tra gói đăng ký: ${checkSubError.message}`);
        }
        
        // Chỉ tạo gói đăng ký nếu chưa có
        if (!existingSub) {
          console.log('[sync-user] Người dùng chưa có gói đăng ký, đang tạo gói Cơ bản');
          
          // Tìm gói đăng ký cơ bản - sử dụng cache
          const findBasicSubscription = async () => {
            // Lấy ID của gói Cơ bản
            const { data: basicSub, error: basicSubError } = await cachedQuery(
              'basic_subscription',
              () => supabaseAdmin
                .from('subscriptions')
                .select('id')
                .eq('name', 'Cơ bản')
                .maybeSingle()
            );
            
            if (basicSubError) {
              throw basicSubError;
            }
            
            if (basicSub) {
              return basicSub.id;
            }
            
            // Nếu không tìm thấy "Cơ bản", thử lấy gói đầu tiên
            const { data: firstSub, error: firstSubError } = await cachedQuery(
              'first_subscription',
              () => supabaseAdmin
                .from('subscriptions')
                .select('id, name')
                .order('id', { ascending: true })
                .limit(1)
                .single()
            );
            
            if (firstSubError || !firstSub) {
              throw firstSubError || new Error("Không tìm thấy gói đăng ký nào");
            }
            
            return firstSub.id;
          };
          
          try {
            // Tìm gói đăng ký với retry
            const basicSubId = await retryOperation(() => findBasicSubscription());
            
            if (basicSubId) {
              console.log('[sync-user] Tạo subscription với gói ID:', basicSubId);
              
              const startDate = new Date().toISOString().split('T')[0];
              const endDate = new Date();
              endDate.setMonth(endDate.getMonth() + 1);
              const endDateStr = endDate.toISOString().split('T')[0];
              
              // Tạo subscription với retry tối ưu
              const { data: newSub, error: subError } = await retryOperation(
                () => supabaseAdmin
                  .from('user_subscriptions')
                  .insert({
                    user_id: user_id,
                    subscription_id: basicSubId,
                    start_date: startDate,
                    end_date: endDateStr,
                    status: 'active'
                  })
                  .select()
              );
              
              if (subError) {
                throw subError;
              }
              
              console.log('[sync-user] Đã tạo gói đăng ký thành công:', newSub);
            } else {
              console.warn('[sync-user] Không tìm thấy gói đăng ký để gán cho người dùng.');
              warnings.push('Không tìm thấy gói đăng ký để gán cho người dùng');
            }
          } catch (subError) {
            console.error('[sync-user] Lỗi khi tạo gói đăng ký:', subError);
            warnings.push(`Lỗi khi tạo gói đăng ký: ${subError.message || 'Lỗi không xác định'}`);
          }
        } else {
          console.log('[sync-user] Người dùng đã có gói đăng ký, ID:', existingSub.id);
        }
      }
    } catch (subError) {
      // Xử lý lỗi tạo subscription nhưng vẫn trả về thành công cho việc tạo user
      console.error('[sync-user] Lỗi xử lý subscription nhưng user đã được tạo:', subError);
      warnings.push(`Lỗi khi tạo gói đăng ký: ${subError.message || 'Lỗi không xác định'}`);
      
      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'Đồng bộ thành công nhưng có lỗi khi tạo gói đăng ký', 
          data: userData,
          warnings: warnings,
          userCreated: userCreated
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Đồng bộ thành công', 
        data: userData,
        warnings: warnings.length > 0 ? warnings : undefined,
        userCreated: userCreated
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('[sync-user] Lỗi xử lý:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi không xác định khi đồng bộ dữ liệu người dùng',
        detail: error instanceof Error ? error.toString() : 'Unknown error object',
        warnings: ['Lỗi xử lý nghiêm trọng trong quá trình đồng bộ dữ liệu người dùng']
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
