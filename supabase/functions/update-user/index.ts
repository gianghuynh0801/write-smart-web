
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

  try {
    console.log('[update-user] Nhận request mới')
    
    // Xác thực người dùng
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('[update-user] Thiếu Authorization header')
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: 'Thiếu thông tin xác thực' 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    console.log('[update-user] Đang xác thực token')
    
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !caller) {
      console.error('[update-user] Lỗi xác thực:', authError)
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: `Xác thực không thành công: ${authError?.message || 'Token không hợp lệ'}` 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    console.log('[update-user] Xác thực thành công cho user:', caller.id)
    
    // Kiểm tra quyền admin
    console.log('[update-user] Đang kiểm tra quyền admin cho user:', caller.id)
    
    try {
      const { data: isAdmin, error: adminCheckError } = await supabaseAdmin.rpc('is_admin', { uid: caller.id })
      
      if (adminCheckError) {
        console.error('[update-user] Lỗi khi kiểm tra quyền admin:', adminCheckError)
        return new Response(
          JSON.stringify({ 
            data: null, 
            error: `Lỗi khi kiểm tra quyền quản trị: ${adminCheckError.message}` 
          }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        )
      }
      
      if (!isAdmin) {
        console.error('[update-user] Người dùng không có quyền admin:', caller.id)
        return new Response(
          JSON.stringify({ 
            data: null, 
            error: 'Bạn không có quyền thực hiện thao tác này' 
          }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403 
          }
        )
      }
      
      console.log('[update-user] Xác nhận quyền admin thành công')
    } catch (adminError) {
      console.error('[update-user] Lỗi khi kiểm tra quyền admin:', adminError)
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: `Lỗi xác thực quyền: ${adminError instanceof Error ? adminError.message : String(adminError)}` 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Lấy dữ liệu từ request
    let requestData
    try {
      requestData = await req.json()
    } catch (parseError) {
      console.error('[update-user] Lỗi khi parse dữ liệu request:', parseError)
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: 'Dữ liệu request không hợp lệ' 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }
    
    const { id, userData } = requestData
    
    if (!id || !userData) {
      console.error('[update-user] Thiếu thông tin cần thiết:', requestData)
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: 'Thiếu thông tin người dùng cần cập nhật' 
        }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
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
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: `Lỗi khi kiểm tra người dùng: ${getUserError.message}` 
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    if (!existingUser) {
      console.error('[update-user] Không tìm thấy user:', id)
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: 'Không tìm thấy người dùng' 
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
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
      return new Response(
        JSON.stringify({ 
          data: null, 
          error: `Lỗi cập nhật: ${updateError.message}` 
        }), 
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
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
          return new Response(
            JSON.stringify({ 
              data: null, 
              error: `Lỗi khi tìm gói đăng ký: ${subError.message}` 
            }), 
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 500
            }
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
            .update({ status: 'cancelled' })
            .eq('user_id', id)
            .eq('status', 'active')
  
          if (cancelError) {
            console.error('[update-user] Lỗi khi hủy gói đăng ký cũ:', cancelError)
            return new Response(
              JSON.stringify({ 
                data: null, 
                error: `Lỗi khi hủy gói đăng ký cũ: ${cancelError.message}` 
              }), 
              {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
              }
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
              return new Response(
                JSON.stringify({ 
                  data: null, 
                  error: `Lỗi khi tạo gói đăng ký mới: ${createSubError.message}` 
                }), 
                {
                  headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                  status: 500
                }
              )
            }
          }
        }
      } catch (subProcessError) {
        console.error('[update-user] Lỗi khi xử lý gói đăng ký:', subProcessError)
        return new Response(
          JSON.stringify({ 
            data: null, 
            error: `Lỗi xử lý gói đăng ký: ${subProcessError instanceof Error ? subProcessError.message : String(subProcessError)}` 
          }), 
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          }
        )
      }
    }

    // Trả về kết quả thành công
    console.log('[update-user] Cập nhật thành công, đang trả về kết quả')
    return new Response(
      JSON.stringify({ 
        data: { ...updatedUser, subscription: userData.subscription },
        error: null
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('[update-user] Lỗi không mong đợi:', error)
    return new Response(
      JSON.stringify({ 
        data: null,
        error: error instanceof Error ? error.message : String(error)
      }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
