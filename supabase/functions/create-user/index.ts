
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

Deno.serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[create-user] Nhận request mới')
    
    // Xác thực người dùng
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[create-user] Thiếu Authorization header')
      return standardResponse(null, 'Thiếu thông tin xác thực', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('[create-user] Đang xác thực token')
    
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !caller) {
      console.error('[create-user] Lỗi xác thực:', authError)
      return standardResponse(
        null, 
        `Xác thực không thành công: ${authError?.message || 'Token không hợp lệ'}`,
        401
      )
    }

    console.log('[create-user] Xác thực thành công cho user:', caller.id)
    
    // Kiểm tra quyền admin
    console.log('[create-user] Đang kiểm tra quyền admin cho user:', caller.id)
    
    try {
      const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc('is_admin', { uid: caller.id })
      
      if (adminCheckError) {
        console.error('[create-user] Lỗi khi kiểm tra quyền admin:', adminCheckError)
        return standardResponse(
          null,
          `Lỗi khi kiểm tra quyền quản trị: ${adminCheckError.message}`,
          403
        )
      }
      
      if (!isAdmin) {
        console.error('[create-user] Người dùng không có quyền admin:', caller.id)
        return standardResponse(
          null,
          'Bạn không có quyền thực hiện thao tác này',
          403
        )
      }
      
      console.log('[create-user] Xác nhận quyền admin thành công')
    } catch (adminError) {
      console.error('[create-user] Lỗi khi kiểm tra quyền admin:', adminError)
      return standardResponse(
        null,
        `Lỗi xác thực quyền: ${adminError instanceof Error ? adminError.message : String(adminError)}`,
        500
      )
    }

    // Lấy dữ liệu từ request
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      console.error('[create-user] Lỗi khi parse dữ liệu request:', parseError)
      return standardResponse(
        null,
        'Dữ liệu request không hợp lệ',
        400
      )
    }
    
    const { userData } = requestData
    
    if (!userData) {
      console.error('[create-user] Thiếu thông tin người dùng:', requestData)
      return standardResponse(
        null,
        'Thiếu thông tin người dùng cần tạo',
        400
      )
    }

    console.log("[create-user] Đang tạo user mới:", userData)

    const newId = crypto.randomUUID();

    // Tạo user mới
    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert([
        {
          id: newId,
          name: userData.name,
          email: userData.email,
          credits: userData.credits,
          status: userData.status,
          avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
          role: userData.role
        }
      ])
      .select()
      .single()

    if (createError) {
      console.error('[create-user] Lỗi khi tạo user:', createError)
      return standardResponse(
        null,
        `Lỗi khi tạo user: ${createError.message}`,
        500
      )
    }

    // Xử lý gói đăng ký nếu có
    if (
      userData.subscription &&
      userData.subscription !== "Không có" &&
      userData.subscription !== "Cơ bản"
    ) {
      try {
        const { data: subscriptionData, error: subError } = await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("name", userData.subscription)
          .maybeSingle();
        
        if (subError) {
          console.error('[create-user] Lỗi khi tìm gói đăng ký:', subError)
          return standardResponse(
            newUser,
            `Tạo user thành công nhưng có lỗi khi tìm gói đăng ký: ${subError.message}`,
            200
          )
        }
        
        if (subscriptionData) {
          const startDate = new Date().toISOString().split('T')[0];
          const endDate = new Date();
          endDate.setMonth(endDate.getMonth() + 1);
          const endDateStr = endDate.toISOString().split('T')[0];
          
          const { error: createSubError } = await supabaseAdmin
            .from("user_subscriptions")
            .insert({
              user_id: newId,
              subscription_id: subscriptionData.id,
              start_date: startDate,
              end_date: endDateStr,
              status: "active"
            });

          if (createSubError) {
            console.error('[create-user] Lỗi khi tạo gói đăng ký:', createSubError)
            return standardResponse(
              newUser,
              `Tạo user thành công nhưng có lỗi khi tạo gói đăng ký: ${createSubError.message}`,
              200
            )
          }

          // Cập nhật thông tin user với subscription
          const { error: updateSubError } = await supabaseAdmin
            .from('users')
            .update({ subscription: userData.subscription })
            .eq('id', newId)
            
          if (updateSubError) {
            console.log('[create-user] Lỗi khi cập nhật subscription trong users:', updateSubError)
          }
        }
      } catch (subError) {
        console.error('[create-user] Lỗi khi xử lý gói đăng ký:', subError)
        return standardResponse(
          newUser,
          `Tạo user thành công nhưng có lỗi khi xử lý gói đăng ký: ${subError instanceof Error ? subError.message : String(subError)}`,
          200
        )
      }
    }

    // Lấy thông tin đầy đủ của user sau khi tạo
    const { data: finalUserData, error: finalUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', newId)
      .single()
      
    if (finalUserError) {
      console.error('[create-user] Lỗi khi lấy thông tin cuối cùng của user:', finalUserError)
      return standardResponse(
        newUser,
        null,
        200
      )
    }

    // Trả về kết quả thành công
    console.log('[create-user] Tạo user thành công, đang trả về kết quả')
    return standardResponse(
      finalUserData,
      null,
      200
    )

  } catch (error) {
    console.error('[create-user] Lỗi không mong đợi:', error)
    return standardResponse(
      null,
      error instanceof Error ? error.message : String(error),
      500
    )
  }
})
