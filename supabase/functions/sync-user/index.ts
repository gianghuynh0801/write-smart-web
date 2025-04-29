
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
    let userCreated = false;
    let warnings = [];
    
    // Nếu người dùng chưa tồn tại, tạo mới
    if (!existingUser) {
      console.log('[sync-user] Người dùng chưa tồn tại, đang tạo mới');
      
      // Sử dụng cơ chế thử lại khi tạo người dùng
      let userCreationAttempts = 0;
      const maxUserCreationAttempts = 5; // Tăng lên 5 lần thử
      
      while (userCreationAttempts < maxUserCreationAttempts) {
        try {
          userCreationAttempts++;
          console.log(`[sync-user] Nỗ lực tạo người dùng lần ${userCreationAttempts}/${maxUserCreationAttempts}`);
          
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
            console.error(`[sync-user] Lỗi khi tạo người dùng (lần thử ${userCreationAttempts}):`, insertError);
            
            // Kiểm tra lỗi trùng lặp dữ liệu
            if (insertError.message.includes('duplicate') || insertError.message.includes('already exists')) {
              console.log('[sync-user] Phát hiện user đã tồn tại (lỗi trùng lặp), kiểm tra lại');
              const { data: existingUserRetry } = await supabaseAdmin
                .from('users')
                .select('*')
                .eq('id', user_id)
                .maybeSingle();
                
              if (existingUserRetry) {
                console.log('[sync-user] Đã xác nhận user tồn tại:', existingUserRetry);
                userData = existingUserRetry;
                userCreated = false;
                break; // Thoát khỏi vòng lặp nếu xác nhận người dùng đã tồn tại
              }
            }
            
            if (userCreationAttempts < maxUserCreationAttempts) {
              // Đợi tăng dần trước khi thử lại
              const delay = userCreationAttempts * 1000;
              console.log(`[sync-user] Đợi ${delay}ms trước khi thử lại...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            } else {
              throw insertError;
            }
          }
          
          userData = newUser;
          userCreated = true;
          console.log('[sync-user] Đã tạo người dùng thành công:', userData);
          
          // Đợi ngắn để đảm bảo user đã được tạo xong
          await new Promise(resolve => setTimeout(resolve, 1000));
          break; // Thoát khỏi vòng lặp nếu tạo thành công
        } catch (attemptError) {
          console.error(`[sync-user] Lỗi tạo người dùng lần ${userCreationAttempts}:`, attemptError);
          
          if (userCreationAttempts >= maxUserCreationAttempts) {
            warnings.push(`Không thể tạo người dùng sau ${maxUserCreationAttempts} lần thử`);
            throw new Error(`Không thể tạo người dùng sau ${maxUserCreationAttempts} lần thử: ${attemptError.message || 'Lỗi không xác định'}`);
          }
          
          // Đợi tăng dần trước khi thử lại
          const delay = userCreationAttempts * 1000;
          console.log(`[sync-user] Đợi ${delay}ms trước khi thử lại...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } else {
      console.log('[sync-user] Người dùng đã tồn tại, id:', existingUser.id);
      userData = existingUser;
      userCreated = false;
    }

    // Kiểm tra và tạo gói đăng ký cơ bản nếu cần
    try {
      console.log('[sync-user] Đang kiểm tra gói đăng ký cho người dùng');
      
      // Kiểm tra xem bảng subscriptions có tồn tại không
      const { data: tableExists } = await supabaseAdmin.rpc('check_table_exists', { 
        table_name: 'subscriptions'
      });
      
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
          
          // Sử dụng cơ chế thử lại khi truy vấn gói Cơ bản
          let subAttempts = 0;
          const maxSubAttempts = 3;
          let basicSubId = null;
          
          while (subAttempts < maxSubAttempts && basicSubId === null) {
            try {
              subAttempts++;
              console.log(`[sync-user] Nỗ lực tìm gói Cơ bản lần ${subAttempts}/${maxSubAttempts}`);
              
              // Lấy ID của gói Cơ bản - chính xác tên "Cơ bản"
              const { data: basicSub, error: basicSubError } = await supabaseAdmin
                .from('subscriptions')
                .select('id')
                .eq('name', 'Cơ bản')
                .maybeSingle();
              
              if (basicSubError) {
                console.warn(`[sync-user] Lỗi khi tìm gói Cơ bản (lần ${subAttempts}):`, basicSubError);
                const delay = subAttempts * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
              }
              
              if (basicSub) {
                basicSubId = basicSub.id;
                console.log('[sync-user] Đã tìm thấy gói Cơ bản, ID:', basicSubId);
              } else {
                console.warn('[sync-user] Không tìm thấy gói có tên "Cơ bản", thử tìm bất kỳ gói đầu tiên');
                
                // Nếu không tìm thấy "Cơ bản", thử lấy gói đầu tiên
                const { data: firstSub, error: firstSubError } = await supabaseAdmin
                  .from('subscriptions')
                  .select('id, name')
                  .order('id', { ascending: true })
                  .limit(1)
                  .single();
                
                if (firstSubError || !firstSub) {
                  console.error('[sync-user] Lỗi khi tìm bất kỳ gói đăng ký nào:', firstSubError);
                  const delay = subAttempts * 1000;
                  await new Promise(resolve => setTimeout(resolve, delay));
                  continue;
                } else {
                  basicSubId = firstSub.id;
                  console.log(`[sync-user] Sử dụng gói đăng ký đầu tiên "${firstSub.name}" với ID: ${basicSubId}`);
                }
              }
            } catch (subQueryError) {
              console.error(`[sync-user] Lỗi không xác định khi tìm gói Cơ bản (lần ${subAttempts}):`, subQueryError);
              if (subAttempts >= maxSubAttempts) {
                console.error('[sync-user] Đã hết số lần thử tìm gói Cơ bản');
                warnings.push('Không thể tìm gói đăng ký Cơ bản sau nhiều lần thử');
                break;
              }
              const delay = subAttempts * 1000;
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }

          // Nếu tìm được gói đăng ký
          if (basicSubId !== null) {
            console.log('[sync-user] Tạo subscription với gói ID:', basicSubId);
            
            const startDate = new Date().toISOString().split('T')[0];
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);
            const endDateStr = endDate.toISOString().split('T')[0];
            
            // Thử tạo subscription nhiều lần nếu cần
            let createSubAttempts = 0;
            const maxCreateSubAttempts = 3;
            
            while (createSubAttempts < maxCreateSubAttempts) {
              try {
                createSubAttempts++;
                console.log(`[sync-user] Nỗ lực tạo subscription lần ${createSubAttempts}/${maxCreateSubAttempts}`);
                
                // Tạo subscription cho user
                const { data: newSub, error: subError } = await supabaseAdmin
                  .from('user_subscriptions')
                  .insert({
                    user_id: user_id,
                    subscription_id: basicSubId,
                    start_date: startDate,
                    end_date: endDateStr,
                    status: 'active'
                  })
                  .select();
                
                if (subError) {
                  console.error(`[sync-user] Lỗi khi tạo gói đăng ký (lần ${createSubAttempts}):`, subError);
                  
                  if (createSubAttempts < maxCreateSubAttempts) {
                    const delay = createSubAttempts * 1500;
                    console.log(`[sync-user] Đợi ${delay}ms trước khi thử lại...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                  } else {
                    warnings.push(`Không thể tạo gói đăng ký sau ${maxCreateSubAttempts} lần thử`);
                    throw subError;
                  }
                }
                
                console.log('[sync-user] Đã tạo gói đăng ký thành công:', newSub);
                break; // Thoát vòng lặp khi thành công
              } catch (createSubError) {
                console.error(`[sync-user] Lỗi khi tạo gói đăng ký lần ${createSubAttempts}:`, createSubError);
                
                if (createSubAttempts >= maxCreateSubAttempts) {
                  // Nếu đã thử đủ số lần, ghi nhật ký nhưng không ném lỗi - người dùng vẫn được tạo
                  console.error('[sync-user] Không thể tạo gói đăng ký sau nhiều lần thử.');
                  warnings.push('Không thể tạo gói đăng ký sau nhiều lần thử');
                  break;
                }
                
                // Đợi trước khi thử lại
                const delay = createSubAttempts * 1500;
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            }
          } else {
            console.warn('[sync-user] Không thể tìm gói đăng ký nào để gán cho người dùng.');
            warnings.push('Không tìm thấy gói đăng ký để gán cho người dùng');
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
