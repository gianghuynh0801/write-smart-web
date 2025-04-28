
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
    console.log('[update-user] Nhận request mới')
    
    // Xác thực người dùng
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[update-user] Thiếu Authorization header')
      return standardResponse(null, 'Thiếu thông tin xác thực', 401)
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('[update-user] Đang xác thực token')
    
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
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
    console.log('[update-user] Đang kiểm tra quyền admin cho user:', caller.id)
    
    try {
      const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc('is_admin', { uid: caller.id })
      
      if (adminCheckError) {
        console.error('[update-user] Lỗi khi kiểm tra quyền admin:', adminCheckError)
        return standardResponse(
          null,
          `Lỗi khi kiểm tra quyền quản trị: ${adminCheckError.message}`,
          403
        )
      }
      
      if (!isAdmin) {
        console.error('[update-user] Người dùng không có quyền admin:', caller.id)
        return standardResponse(
          null,
          'Bạn không có quyền thực hiện thao tác này',
          403
        )
      }
      
      console.log('[update-user] Xác nhận quyền admin thành công')
    } catch (adminError) {
      console.error('[update-user] Lỗi khi kiểm tra quyền admin:', adminError)
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
      console.error('[update-user] Lỗi khi parse dữ liệu request:', parseError)
      return standardResponse(
        null,
        'Dữ liệu request không hợp lệ',
        400
      )
    }
    
    const { id, userData } = requestData
    
    if (!id || !userData) {
      console.error('[update-user] Thiếu thông tin cần thiết:', requestData)
      return standardResponse(
        null,
        'Thiếu thông tin người dùng cần cập nhật',
        400
      )
    }

    console.log("[update-user] Đang cập nhật user:", { id, userData })

    // Kiểm tra user tồn tại
    console.log('[update-user] Đang kiểm tra tồn tại của user:', id)
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (getUserError) {
      console.error('[update-user] Lỗi khi kiểm tra user:', getUserError)
      return standardResponse(
        null,
        `Lỗi khi kiểm tra người dùng: ${getUserError.message}`,
        500
      )
    }

    if (!existingUser) {
      console.error('[update-user] Không tìm thấy user:', id)
      return standardResponse(
        null,
        'Không tìm thấy người dùng',
        404
      )
    }

    // Cập nhật thông tin user
    console.log('[update-user] Đang cập nhật thông tin user:', id)
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        name: userData.name,
        email: userData.email,
        credits: userData.credits,
        status: userData.status,
        role: userData.role
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('[update-user] Lỗi khi cập nhật:', updateError)
      return standardResponse(
        null,
        `Lỗi cập nhật: ${updateError.message}`,
        500
      )
    }

    // Xử lý thay đổi gói đăng ký nếu có
    let subscriptionChanged = false
    console.log('[update-user] Kiểm tra thay đổi gói đăng ký:', {
      current: existingUser.subscription,
      new: userData.subscription
    })
    
    if (existingUser.subscription !== userData.subscription) {
      subscriptionChanged = true
      console.log('[update-user] Cập nhật gói đăng ký:', { 
        from: existingUser.subscription, 
        to: userData.subscription 
      })
      
      try {
        // Tìm subscription id
        const { data: subscriptionData, error: subError } = await supabaseAdmin
          .from('subscriptions')
          .select('id')
          .eq('name', userData.subscription)
          .maybeSingle()
  
        if (subError) {
          console.error('[update-user] Lỗi khi tìm gói đăng ký:', subError)
          return standardResponse(
            null,
            `Lỗi khi tìm gói đăng ký: ${subError.message}`,
            500
          )
        }
  
        if (subscriptionData) {
          const startDate = new Date().toISOString().split('T')[0]
          const endDate = new Date()
          endDate.setMonth(endDate.getMonth() + 1)
          const endDateStr = endDate.toISOString().split('T')[0]
  
          // Hủy các gói đăng ký cũ
          console.log('[update-user] Hủy gói đăng ký cũ của user:', id)
          const { error: cancelError } = await supabaseAdmin
            .from('user_subscriptions')
            .update({ status: 'inactive' })
            .eq('user_id', id)
            .eq('status', 'active')
  
          if (cancelError) {
            console.error('[update-user] Lỗi khi hủy gói đăng ký cũ:', cancelError)
            return standardResponse(
              null,
              `Lỗi khi hủy gói đăng ký cũ: ${cancelError.message}`,
              500
            )
          }
  
          // Tạo gói đăng ký mới
          if (userData.subscription !== 'Không có') {
            console.log('[update-user] Tạo gói đăng ký mới cho user:', id)
            const { error: createSubError } = await supabaseAdmin
              .from('user_subscriptions')
              .insert({
                user_id: id,
                subscription_id: subscriptionData.id,
                start_date: startDate,
                end_date: endDateStr,
                status: 'active'
              })
  
            if (createSubError) {
              console.error('[update-user] Lỗi khi tạo gói đăng ký mới:', createSubError)
              return standardResponse(
                null,
                `Lỗi khi tạo gói đăng ký mới: ${createSubError.message}`,
                500
              )
            }
          }

          // Cập nhật thông tin user với subscription mới
          console.log('[update-user] Cập nhật thông tin subscription trong bảng users')
          const { error: updateUserSubError } = await supabaseAdmin
            .from('users')
            .update({ subscription: userData.subscription })
            .eq('id', id)
            
          if (updateUserSubError) {
            console.error('[update-user] Lỗi khi cập nhật subscription trong users:', updateUserSubError)
            return standardResponse(
              null,
              `Lỗi khi cập nhật subscription: ${updateUserSubError.message}`,
              500
            )
          }
        }
      } catch (subProcessError) {
        console.error('[update-user] Lỗi khi xử lý gói đăng ký:', subProcessError)
        return standardResponse(
          null,
          `Lỗi xử lý gói đăng ký: ${subProcessError instanceof Error ? subProcessError.message : String(subProcessError)}`,
          500
        )
      }
    }

    // Lấy thông tin đầy đủ của user sau khi cập nhật
    console.log('[update-user] Lấy thông tin user sau khi cập nhật')
    const { data: finalUserData, error: finalUserError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
      
    if (finalUserError) {
      console.error('[update-user] Lỗi khi lấy thông tin cuối cùng của user:', finalUserError)
      return standardResponse(
        updatedUser,
        null,
        200
      )
    }

    // Trả về kết quả thành công
    console.log('[update-user] Cập nhật thành công, đang trả về kết quả')
    return standardResponse(
      finalUserData,
      null,
      200
    )

  } catch (error) {
    console.error('[update-user] Lỗi không mong đợi:', error)
    return standardResponse(
      null,
      error instanceof Error ? error.message : String(error),
      500
    )
  }
})
